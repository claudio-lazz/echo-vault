import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

import { build402Challenge, verify402Payment } from './x402';
import { validateOnchainGrant } from './solana';
import { storeBlob, fetchBlob } from './storage';

export const app = express();
app.use(express.json());

type Vault = {
  owner: string;
  context_uri: string;
  encrypted_blob: unknown;
};

type Grant = {
  owner: string;
  grantee: string;
  scope_hash: string;
  expires_at: number | null;
};

type PaymentPayload = {
  txSig?: string;
  mint?: string;
  amount?: string | number;
  payer?: string;
  recipient?: string;
};

type ContextRequestBody = {
  owner?: string;
  grantee?: string;
  scope_hash?: string;
  payment?: PaymentPayload | null;
};

// In-memory stores (dev stub)
const vaults = new Map<string, Vault>();
const grants = new Map<string, Grant>();
const revoked = new Set<string>();
const blobs = new Map<string, unknown>();

const vaultKey = (owner: string) => owner;
const grantKey = ({ owner, grantee, scope_hash }: { owner: string; grantee: string; scope_hash: string }) => `${owner}:${grantee}:${scope_hash}`;
const blobKey = ({ owner, context_uri }: { owner: string; context_uri: string }) => `${owner}:${context_uri}`;

const grantStatus = (grant: Grant) => {
  const key = grantKey(grant);
  if (revoked.has(key)) return 'revoked';
  if (grant.expires_at && Date.now() / 1000 > grant.expires_at) return 'expired';
  return 'active';
};

const summarizeGrants = (list: Grant[]) =>
  list.reduce(
    (acc, grant) => {
      const status = grantStatus(grant);
      acc[status] += 1;
      return acc;
    },
    { active: 0, revoked: 0, expired: 0 }
  );

const storePath = process.env.ECHOVAULT_STORE_PATH || path.join(process.cwd(), 'echovault-store.json');

function loadStore() {
  try {
    if (!fs.existsSync(storePath)) return;
    const data = JSON.parse(fs.readFileSync(storePath, 'utf8')) as {
      vaults?: Vault[];
      grants?: Grant[];
      revoked?: string[];
      blobs?: { key: string; value: unknown }[];
    };
    (data.vaults || []).forEach((vault) => vaults.set(vaultKey(vault.owner), vault));
    (data.grants || []).forEach((grant) => grants.set(grantKey(grant), grant));
    (data.revoked || []).forEach((key) => revoked.add(key));
    (data.blobs || []).forEach(({ key, value }) => blobs.set(key, value));
  } catch (e) {
    const err = e as Error;
    console.warn('store_load_failed', err.message);
  }
}

function saveStore() {
  const data = {
    vaults: Array.from(vaults.values()),
    grants: Array.from(grants.values()),
    revoked: Array.from(revoked),
    blobs: Array.from(blobs.entries()).map(([key, value]) => ({ key, value }))
  };
  fs.writeFileSync(storePath, JSON.stringify(data, null, 2));
}

loadStore();

// Health
app.get('/health', (_: Request, res: Response) => res.json({ ok: true }));

// Status (dev)
app.get('/status', (_: Request, res: Response) => {
  res.json({
    ok: true,
    counts: {
      vaults: vaults.size,
      grants: grants.size,
      revoked: revoked.size,
      blobs: blobs.size
    },
    storePath
  });
});

// Dev reset (dangerous; clears in-memory + store)
app.post('/dev/reset', (_: Request, res: Response) => {
  vaults.clear();
  grants.clear();
  revoked.clear();
  blobs.clear();
  saveStore();
  res.json({ ok: true });
});

// Vault init (dev stub)
app.post('/vault/init', (req: Request<{}, {}, { owner?: string; context_uri?: string; encrypted_blob?: unknown }>, res: Response) => {
  const { owner, context_uri, encrypted_blob } = req.body || {};
  if (!owner) return res.status(400).json({ ok: false, reason: 'missing_owner', code: 'missing_owner' });
  if (!context_uri) return res.status(400).json({ ok: false, reason: 'missing_context_uri', code: 'missing_context_uri' });
  if (!encrypted_blob) return res.status(400).json({ ok: false, reason: 'missing_encrypted_blob', code: 'missing_encrypted_blob' });
  const vault: Vault = {
    owner,
    context_uri: context_uri || 'ipfs://encrypted-context-placeholder',
    encrypted_blob: encrypted_blob || 'ENCRYPTED_BLOB_PLACEHOLDER'
  };
  vaults.set(vaultKey(owner), vault);
  blobs.set(blobKey({ owner, context_uri: vault.context_uri }), vault.encrypted_blob);
  storeBlob({ owner, context_uri: vault.context_uri, encrypted_blob: vault.encrypted_blob })
    .then((stored) => {
      saveStore();
      res.status(200).json({ ok: true, vault: { ...vault, storage: stored?.location || null } });
    })
    .catch(() => {
      saveStore();
      res.status(200).json({ ok: true, vault });
    });
});

// Vault list (dev stub)
app.get('/vaults', (req: Request<{}, {}, {}, { owner?: string }>, res: Response) => {
  const { owner } = req.query || {};
  const list = Array.from(vaults.values()).filter((vault) => !owner || vault.owner === owner);
  const vaultList = list.map((vault) => {
    const grantList = Array.from(grants.values()).filter((grant) => grant.owner === vault.owner);
    return {
      owner: vault.owner,
      context_uri: vault.context_uri,
      storage: process.env.ECHOVAULT_STORAGE_DIR ? 'filesystem' : 'memory',
      grants: {
        total: grantList.length,
        counts: summarizeGrants(grantList)
      }
    };
  });
  res.status(200).json({ ok: true, vaults: vaultList });
});

// Vault fetch (dev stub)
app.get('/vault/:owner', (req: Request<{ owner: string }>, res: Response, next: NextFunction) => {
  const owner = req.params.owner;
  if (owner === 'grants') return next();
  const vault = vaults.get(vaultKey(owner));
  if (!vault) return res.status(404).json({ ok: false, reason: 'vault_not_found', code: 'vault_not_found' });
  res.status(200).json({ ok: true, vault });
});

// Grant access (dev stub)
app.post('/vault/grant', (req: Request<{}, {}, { owner?: string; grantee?: string; scope_hash?: string; expires_at?: string | number }>, res: Response) => {
  const { owner, grantee, scope_hash, expires_at } = req.body || {};
  if (!owner || !grantee || !scope_hash) return res.status(400).json({ ok: false, reason: 'missing_fields', code: 'missing_fields' });
  const grant: Grant = { owner, grantee, scope_hash, expires_at: Number(expires_at) || null };
  const key = grantKey(grant);
  grants.set(key, grant);
  revoked.delete(key);
  saveStore();
  res.status(200).json({ ok: true, grant });
});

// Revoke access (dev stub)
app.post('/vault/revoke', (req: Request<{}, {}, { owner?: string; grantee?: string; scope_hash?: string }>, res: Response) => {
  const { owner, grantee, scope_hash } = req.body || {};
  if (!owner || !grantee || !scope_hash) return res.status(400).json({ ok: false, reason: 'missing_fields', code: 'missing_fields' });
  const key = grantKey({ owner, grantee, scope_hash });
  if (!grants.has(key)) return res.status(404).json({ ok: false, reason: 'grant_not_found', code: 'grant_not_found' });
  revoked.add(key);
  saveStore();
  res.status(200).json({ ok: true, revoked: true });
});

// Grant summary (dev stub)
app.get('/vault/grants/summary', (req: Request<{}, {}, {}, { owner?: string; grantee?: string }>, res: Response) => {
  const { owner, grantee } = req.query || {};
  const list = Array.from(grants.values()).filter((grant) => {
    if (owner && grant.owner !== owner) return false;
    if (grantee && grant.grantee !== grantee) return false;
    return true;
  });
  const counts = summarizeGrants(list);
  res.status(200).json({ ok: true, total: list.length, counts });
});

// List grants (dev stub)
app.get('/vault/grants', (req: Request<{}, {}, {}, { owner?: string; grantee?: string; status?: string }>, res: Response) => {
  const { owner, grantee, status } = req.query || {};
  const allowedStatuses = new Set(['active', 'revoked', 'expired', 'all']);
  if (status && !allowedStatuses.has(status)) {
    return res.status(400).json({ ok: false, reason: 'invalid_status', code: 'invalid_status' });
  }
  const list = Array.from(grants.values())
    .filter((grant) => {
      if (owner && grant.owner !== owner) return false;
      if (grantee && grant.grantee !== grantee) return false;
      return true;
    })
    .map((grant) => ({
      ...grant,
      revoked: revoked.has(grantKey(grant)),
      status: grantStatus(grant)
    }))
    .filter((grant) => {
      if (!status || status === 'all') return true;
      return grant.status === status;
    });
  res.status(200).json({ ok: true, grants: list });
});

// Context preview (dev stub + optional on-chain validation)
app.post('/context/preview', async (req: Request<{}, {}, { owner?: string; grantee?: string; scope_hash?: string }>, res: Response) => {
  const { owner, grantee, scope_hash } = req.body || {};
  if (!owner || !grantee || !scope_hash) return res.status(400).json({ ok: false, reason: 'missing_fields', code: 'missing_fields' });

  const strict = process.env.ECHOVAULT_ONCHAIN_STRICT === 'true';
  const onchain = await validateOnchainGrant({ owner, grantee, scope_hash });
  if (onchain.ok) {
    return res.status(200).json({
      ok: true,
      preview: {
        owner,
        grantee,
        scope_hash,
        context_uri: 'onchain',
        byte_length: 0,
        source: 'onchain'
      }
    });
  }
  if (strict && onchain.reason !== 'onchain_not_configured') {
    return res.status(403).json({ ok: false, reason: onchain.reason, code: onchain.reason });
  }

  if (strict) {
    return res.status(403).json({ ok: false, reason: 'onchain_not_configured', code: 'onchain_not_configured' });
  }

  const key = grantKey({ owner, grantee, scope_hash });
  const grant = grants.get(key);
  if (!grant) return res.status(403).json({ ok: false, reason: 'grant_not_found', code: 'grant_not_found' });
  if (revoked.has(key)) return res.status(403).json({ ok: false, reason: 'grant_revoked', code: 'grant_revoked' });
  if (grant.expires_at && Date.now() / 1000 > grant.expires_at) return res.status(403).json({ ok: false, reason: 'grant_expired', code: 'grant_expired' });
  const vault = vaults.get(vaultKey(owner));
  if (!vault) return res.status(404).json({ ok: false, reason: 'vault_not_found', code: 'vault_not_found' });
  const blob = blobs.get(blobKey({ owner, context_uri: vault.context_uri }));
  res.status(200).json({
    ok: true,
    preview: {
      owner,
      grantee,
      scope_hash,
      context_uri: vault.context_uri,
      byte_length: blob ? String(blob).length : 0,
      source: 'dev',
      storage: process.env.ECHOVAULT_STORAGE_DIR ? 'filesystem' : 'memory'
    }
  });
});

// Context request endpoint (dev stub + optional on-chain validation)
app.post('/context/request', async (req: Request<{}, {}, ContextRequestBody>, res: Response) => {
  const { owner, grantee, scope_hash, payment } = req.body || {};
  if (!owner || !grantee || !scope_hash) return res.status(400).json({ ok: false, reason: 'missing_fields', code: 'missing_fields' });

  const strict = process.env.ECHOVAULT_ONCHAIN_STRICT === 'true';
  const onchain = await validateOnchainGrant({ owner, grantee, scope_hash });
  if (onchain.ok) {
    if (!payment) return res.status(402).json(build402Challenge({ amount: 0.001, mint: 'USDC' }));
  } else if (strict && onchain.reason !== 'onchain_not_configured') {
    return res.status(403).json({ ok: false, reason: onchain.reason, code: onchain.reason });
  }

  if (strict) {
    return res.status(403).json({ ok: false, reason: 'onchain_not_configured', code: 'onchain_not_configured' });
  }

  const key = grantKey({ owner, grantee, scope_hash });
  const grant = grants.get(key);
  if (!grant) return res.status(403).json({ ok: false, reason: 'grant_not_found', code: 'grant_not_found' });
  if (revoked.has(key)) return res.status(403).json({ ok: false, reason: 'grant_revoked', code: 'grant_revoked' });
  if (grant.expires_at && Date.now() / 1000 > grant.expires_at) return res.status(403).json({ ok: false, reason: 'grant_expired', code: 'grant_expired' });
  if (!payment) {
    return res.status(402).json(build402Challenge({ amount: 0.001, mint: 'USDC' }));
  }
  if (!payment.txSig) return res.status(400).json({ ok: false, reason: 'missing_tx', code: 'missing_tx' });
  if (payment.amount && Number.isNaN(Number(payment.amount))) {
    return res.status(400).json({ ok: false, reason: 'invalid_amount', code: 'invalid_amount' });
  }
  verify402Payment(payment).then((verified) => {
    if (!verified.ok) return res.status(402).json({ ...verified, code: verified.reason || 'payment_failed' });
    const vault = vaults.get(vaultKey(owner));
    if (!vault) return res.status(404).json({ ok: false, reason: 'vault_not_found', code: 'vault_not_found' });
    const stored = blobs.get(blobKey({ owner, context_uri: vault.context_uri }));
    fetchBlob({ owner, context_uri: vault.context_uri }).then((diskBlob) => {
      res.status(200).json({
        ok: true,
        context_uri: vault.context_uri,
        encrypted_blob: diskBlob || stored || vault.encrypted_blob,
        meta: { owner, grantee, scope_hash, payment: verified, source: onchain.ok ? 'onchain' : 'dev' }
      });
    });
  });
});

const port = process.env.PORT || 8787;
if (require.main === module) {
  app.listen(port, () => console.log(`EchoVault API listening on ${port}`));
}

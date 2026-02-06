const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
const { build402Challenge, verify402Payment } = require('./x402');

// Health
app.get('/health', (_, res) => res.json({ ok: true }));

// Status (dev)
app.get('/status', (_, res) => {
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
app.post('/dev/reset', (_, res) => {
  vaults.clear();
  grants.clear();
  revoked.clear();
  blobs.clear();
  saveStore();
  res.json({ ok: true });
});

// In-memory stores (dev stub)
const vaults = new Map();
const grants = new Map();
const revoked = new Set();
const blobs = new Map();

const vaultKey = (owner) => owner;
const grantKey = ({ owner, grantee, scope_hash }) => `${owner}:${grantee}:${scope_hash}`;
const blobKey = ({ owner, context_uri }) => `${owner}:${context_uri}`;

const storePath = process.env.ECHOVAULT_STORE_PATH || path.join(process.cwd(), 'echovault-store.json');

function loadStore() {
  try {
    if (!fs.existsSync(storePath)) return;
    const data = JSON.parse(fs.readFileSync(storePath, 'utf8'));
    (data.vaults || []).forEach((vault) => vaults.set(vaultKey(vault.owner), vault));
    (data.grants || []).forEach((grant) => grants.set(grantKey(grant), grant));
    (data.revoked || []).forEach((key) => revoked.add(key));
    (data.blobs || []).forEach(({ key, value }) => blobs.set(key, value));
  } catch (e) {
    console.warn('store_load_failed', e.message);
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

// Vault init (dev stub)
app.post('/vault/init', (req, res) => {
  const { owner, context_uri, encrypted_blob } = req.body || {};
  if (!owner) return res.status(400).json({ ok: false, reason: 'missing_owner', code: 'missing_owner' });
  if (!context_uri) return res.status(400).json({ ok: false, reason: 'missing_context_uri', code: 'missing_context_uri' });
  if (!encrypted_blob) return res.status(400).json({ ok: false, reason: 'missing_encrypted_blob', code: 'missing_encrypted_blob' });
  const vault = {
    owner,
    context_uri: context_uri || 'ipfs://encrypted-context-placeholder',
    encrypted_blob: encrypted_blob || 'ENCRYPTED_BLOB_PLACEHOLDER'
  };
  vaults.set(vaultKey(owner), vault);
  blobs.set(blobKey({ owner, context_uri: vault.context_uri }), vault.encrypted_blob);
  saveStore();
  res.status(200).json({ ok: true, vault });
});

// Vault fetch (dev stub)
app.get('/vault/:owner', (req, res) => {
  const owner = req.params.owner;
  const vault = vaults.get(vaultKey(owner));
  if (!vault) return res.status(404).json({ ok: false, reason: 'vault_not_found', code: 'vault_not_found' });
  res.status(200).json({ ok: true, vault });
});

// Grant access (dev stub)
app.post('/vault/grant', (req, res) => {
  const { owner, grantee, scope_hash, expires_at } = req.body || {};
  if (!owner || !grantee || !scope_hash) return res.status(400).json({ ok: false, reason: 'missing_fields', code: 'missing_fields' });
  const grant = { owner, grantee, scope_hash, expires_at: Number(expires_at) || null };
  const key = grantKey(grant);
  grants.set(key, grant);
  revoked.delete(key);
  saveStore();
  res.status(200).json({ ok: true, grant });
});

// Revoke access (dev stub)
app.post('/vault/revoke', (req, res) => {
  const { owner, grantee, scope_hash } = req.body || {};
  if (!owner || !grantee || !scope_hash) return res.status(400).json({ ok: false, reason: 'missing_fields', code: 'missing_fields' });
  const key = grantKey({ owner, grantee, scope_hash });
  if (!grants.has(key)) return res.status(404).json({ ok: false, reason: 'grant_not_found', code: 'grant_not_found' });
  revoked.add(key);
  saveStore();
  res.status(200).json({ ok: true, revoked: true });
});

// List grants (dev stub)
app.get('/vault/grants', (req, res) => {
  const { owner, grantee } = req.query || {};
  const list = Array.from(grants.values()).filter((grant) => {
    if (owner && grant.owner !== owner) return false;
    if (grantee && grant.grantee !== grantee) return false;
    return true;
  }).map((grant) => ({
    ...grant,
    revoked: revoked.has(grantKey(grant))
  }));
  res.status(200).json({ ok: true, grants: list });
});

// Context request endpoint (dev stub)
app.post('/context/request', (req, res) => {
  const { owner, grantee, scope_hash, payment } = req.body || {};
  if (!owner || !grantee || !scope_hash) return res.status(400).json({ ok: false, reason: 'missing_fields', code: 'missing_fields' });
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
    res.status(200).json({
      ok: true,
      context_uri: vault.context_uri,
      encrypted_blob: stored || vault.encrypted_blob,
      meta: { owner, grantee, scope_hash, payment: verified }
    });
  });
});

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`EchoVault API listening on ${port}`));

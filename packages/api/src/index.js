const express = require('express');

const app = express();
app.use(express.json());
const { build402Challenge, verify402Payment } = require('./x402');

// Health
app.get('/health', (_, res) => res.json({ ok: true }));

// In-memory vault store (dev stub)
const vaults = new Map();
const vaultKey = (owner) => owner;

// Vault init (dev stub)
app.post('/vault/init', (req, res) => {
  const { owner, context_uri, encrypted_blob } = req.body || {};
  if (!owner) return res.status(400).json({ ok: false, reason: 'missing_owner' });
  const vault = {
    owner,
    context_uri: context_uri || 'ipfs://encrypted-context-placeholder',
    encrypted_blob: encrypted_blob || 'ENCRYPTED_BLOB_PLACEHOLDER'
  };
  vaults.set(vaultKey(owner), vault);
  res.status(200).json({ ok: true, vault });
});

// In-memory grant store (dev stub)
const grants = new Map();
const revoked = new Set();
const grantKey = ({ owner, grantee, scope_hash }) => `${owner}:${grantee}:${scope_hash}`;

// Grant access (dev stub)
app.post('/vault/grant', (req, res) => {
  const { owner, grantee, scope_hash, expires_at } = req.body || {};
  if (!owner || !grantee || !scope_hash) return res.status(400).json({ ok: false, reason: 'missing_fields' });
  const grant = { owner, grantee, scope_hash, expires_at: Number(expires_at) || null };
  const key = grantKey(grant);
  grants.set(key, grant);
  revoked.delete(key);
  res.status(200).json({ ok: true, grant });
});

// Revoke access (dev stub)
app.post('/vault/revoke', (req, res) => {
  const { owner, grantee, scope_hash } = req.body || {};
  if (!owner || !grantee || !scope_hash) return res.status(400).json({ ok: false, reason: 'missing_fields' });
  const key = grantKey({ owner, grantee, scope_hash });
  if (!grants.has(key)) return res.status(404).json({ ok: false, reason: 'grant_not_found' });
  revoked.add(key);
  res.status(200).json({ ok: true, revoked: true });
});

// Context request endpoint (dev stub)
app.post('/context/request', (req, res) => {
  const { owner, grantee, scope_hash, payment } = req.body || {};
  if (!owner || !grantee || !scope_hash) return res.status(400).json({ ok: false, reason: 'missing_fields' });
  const key = grantKey({ owner, grantee, scope_hash });
  const grant = grants.get(key);
  if (!grant) return res.status(403).json({ ok: false, reason: 'grant_not_found' });
  if (revoked.has(key)) return res.status(403).json({ ok: false, reason: 'grant_revoked' });
  if (grant.expires_at && Date.now() / 1000 > grant.expires_at) return res.status(403).json({ ok: false, reason: 'grant_expired' });
  if (!payment) {
    return res.status(402).json(build402Challenge({ amount: 0.001, mint: 'USDC' }));
  }
  verify402Payment(payment).then((verified) => {
    if (!verified.ok) return res.status(402).json(verified);
    const vault = vaults.get(vaultKey(owner));
    if (!vault) return res.status(404).json({ ok: false, reason: 'vault_not_found' });
    res.status(200).json({
      ok: true,
      context_uri: vault.context_uri,
      encrypted_blob: vault.encrypted_blob,
      meta: { owner, grantee, scope_hash, payment: verified }
    });
  });
});

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`EchoVault API listening on ${port}`));

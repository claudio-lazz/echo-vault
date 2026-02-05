const express = require('express');

const app = express();
app.use(express.json());
const { build402Challenge, verify402Payment } = require('./x402');

// Health
app.get('/health', (_, res) => res.json({ ok: true }));

// Vault init (stub)
app.post('/vault/init', (req, res) => {
  const { owner, context_uri } = req.body || {};
  res.status(200).json({ ok: true, owner, context_uri });
});

// In-memory grant store (dev stub)
const grants = new Map();
const grantKey = ({ owner, grantee, scope_hash }) => `${owner}:${grantee}:${scope_hash}`;

// Grant access (dev stub)
app.post('/vault/grant', (req, res) => {
  const { owner, grantee, scope_hash, expires_at } = req.body || {};
  if (!owner || !grantee || !scope_hash) return res.status(400).json({ ok: false, reason: 'missing_fields' });
  const grant = { owner, grantee, scope_hash, expires_at: Number(expires_at) || null };
  grants.set(grantKey(grant), grant);
  res.status(200).json({ ok: true, grant });
});

// Context request endpoint (dev stub)
app.post('/context/request', (req, res) => {
  const { owner, grantee, scope_hash, payment } = req.body || {};
  if (!owner || !grantee || !scope_hash) return res.status(400).json({ ok: false, reason: 'missing_fields' });
  const grant = grants.get(grantKey({ owner, grantee, scope_hash }));
  if (!grant) return res.status(403).json({ ok: false, reason: 'grant_not_found' });
  if (grant.expires_at && Date.now() / 1000 > grant.expires_at) return res.status(403).json({ ok: false, reason: 'grant_expired' });
  if (!payment) {
    return res.status(402).json(build402Challenge({ amount: 0.001, mint: 'USDC' }));
  }
  verify402Payment(payment).then((verified) => {
    if (!verified.ok) return res.status(402).json(verified);
    res.status(200).json({
      ok: true,
      context_uri: 'ipfs://encrypted-context-placeholder',
      meta: { owner, grantee, scope_hash, payment: verified }
    });
  });
});

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`EchoVault API listening on ${port}`));

const express = require('express');

const app = express();
app.use(express.json());
const { build402Challenge, verify402Payment } = require('./x402');

// Health
app.get('/health', (_, res) => res.json({ ok: true }));

// Context request endpoint (placeholder)
app.post('/context/request', (req, res) => {
  const { payment } = req.body || {};
  if (!payment) {
    return res.status(402).json(build402Challenge({ amount: 0.001, mint: 'USDC' }));
  }
  const verified = verify402Payment(payment);
  if (!verified.ok) return res.status(402).json(verified);
  res.status(501).json({ error: 'not_implemented' });
});

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`EchoVault API listening on ${port}`));

const express = require('express');

const app = express();
app.use(express.json());

// Health
app.get('/health', (_, res) => res.json({ ok: true }));

// Context request endpoint (placeholder)
app.post('/context/request', (req, res) => {
  // TODO: verify access grant + x402 payment
  res.status(501).json({ error: 'not_implemented' });
});

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`EchoVault API listening on ${port}`));

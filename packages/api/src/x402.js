// x402 payment helpers (placeholder)

function build402Challenge({ amount, mint }) {
  return {
    status: 402,
    required: true,
    amount,
    mint,
    paymentUrl: "/pay"
  };
}

function verify402Payment(payload) {
  // TODO: verify payment tx signature + mint + amount on Solana
  if (!payload || !payload.txSig) return { ok: false, reason: "missing_tx" };
  return { ok: false, reason: "not_implemented" };
}

module.exports = { build402Challenge, verify402Payment };

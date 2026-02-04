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

function verify402Payment(_payload) {
  // TODO: verify payment tx signature + mint + amount
  return { ok: false, reason: "not_implemented" };
}

module.exports = { build402Challenge, verify402Payment };

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

async function verify402Payment(payload) {
  // TODO: verify payment tx signature + mint + amount on Solana
  if (!payload || !payload.txSig) return { ok: false, reason: "missing_tx" };
  const rpcUrl = process.env.ECHOVAULT_RPC_URL;
  if (!rpcUrl) return { ok: false, reason: "rpc_not_configured" };

  // lightweight RPC lookup (stub)
  try {
    const body = {
      jsonrpc: "2.0",
      id: 1,
      method: "getSignatureStatuses",
      params: [[payload.txSig]]
    };
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const json = await res.json();
    const status = json?.result?.value?.[0];
    if (!status) return { ok: false, reason: "tx_not_found" };
  } catch (e) {
    return { ok: false, reason: "rpc_error" };
  }

  // placeholder: mint/amount validation will be added next
  return { ok: true, reason: "status_found" };
}

module.exports = { build402Challenge, verify402Payment };

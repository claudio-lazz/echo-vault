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
  if (!payload || !payload.txSig) return { ok: false, reason: "missing_tx" };
  const rpcUrl = process.env.ECHOVAULT_RPC_URL;
  if (!rpcUrl) return { ok: false, reason: "rpc_not_configured" };

  const mint = payload.mint || process.env.ECHOVAULT_PAYMENT_MINT || "USDC";
  const amount = payload.amount ? Number(payload.amount) : null;

  const rpc = async (body) => {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    return res.json();
  };

  try {
    // lightweight status check
    const statusJson = await rpc({
      jsonrpc: "2.0",
      id: 1,
      method: "getSignatureStatuses",
      params: [[payload.txSig]]
    });
    const status = statusJson?.result?.value?.[0];
    if (!status) return { ok: false, reason: "tx_not_found" };

    // fetch parsed transaction for mint/amount validation
    const txJson = await rpc({
      jsonrpc: "2.0",
      id: 2,
      method: "getTransaction",
      params: [payload.txSig, { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 }]
    });
    const tx = txJson?.result;
    if (!tx) return { ok: false, reason: "tx_not_found" };

    const collectInstructions = () => {
      const outer = tx?.transaction?.message?.instructions || [];
      const inner = (tx?.meta?.innerInstructions || []).flatMap((ix) => ix.instructions || []);
      return [...outer, ...inner];
    };

    const instructions = collectInstructions();
    const transfers = instructions
      .map((ix) => ix?.parsed)
      .filter(Boolean)
      .filter((parsed) => {
        const program = parsed?.program || parsed?.programId;
        return program === "spl-token" || program === "token" || program === "spl-token-2022";
      })
      .map((parsed) => ({ type: parsed.type, info: parsed.info }))
      .filter((ix) => ix.type === "transfer" || ix.type === "transferChecked");

    const expectedRecipient = payload.recipient || process.env.ECHOVAULT_PAYMENT_RECIPIENT || null;
    const expectedPayer = payload.payer || process.env.ECHOVAULT_PAYMENT_PAYER || null;

    const matches = transfers.some(({ info }) => {
      if (!info) return false;
      if (info.mint && info.mint !== mint) return false;
      const tokenAmount = info.tokenAmount || {};
      const uiAmount = typeof tokenAmount.uiAmount === "number" ? tokenAmount.uiAmount : Number(tokenAmount.uiAmountString);
      if (!Number.isFinite(uiAmount)) return false;
      if (amount != null && uiAmount + 1e-9 < amount) return false;
      if (expectedRecipient && info.destination && info.destination !== expectedRecipient) return false;
      if (expectedPayer) {
        const authority = info.authority || info.owner || null;
        if (authority && authority !== expectedPayer && info.source !== expectedPayer) return false;
      }
      return true;
    });

    if (!matches) {
      const anyRecipient = transfers.some(({ info }) => info?.destination === expectedRecipient);
      const anyPayer = transfers.some(({ info }) => {
        const authority = info?.authority || info?.owner || null;
        return authority === expectedPayer || info?.source === expectedPayer;
      });
      if (expectedRecipient && !anyRecipient) return { ok: false, reason: "recipient_mismatch" };
      if (expectedPayer && !anyPayer) return { ok: false, reason: "payer_mismatch" };
      return { ok: false, reason: "mint_amount_mismatch" };
    }
  } catch (e) {
    return { ok: false, reason: "rpc_error" };
  }

  return { ok: true, reason: "mint_amount_verified", mint };
}

module.exports = { build402Challenge, verify402Payment };

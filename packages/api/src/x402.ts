type Challenge = {
  status: 402;
  required: true;
  amount: number;
  mint: string;
  paymentUrl: string;
};

type VerifyResult =
  | { ok: true; reason: string; mint: string }
  | { ok: false; reason: string };

type PaymentPayload = {
  txSig?: string;
  mint?: string;
  amount?: string | number;
  payer?: string;
  recipient?: string;
};

export function build402Challenge({ amount, mint }: { amount: number; mint: string }): Challenge {
  return {
    status: 402,
    required: true,
    amount,
    mint,
    paymentUrl: '/pay'
  };
}

export async function verify402Payment(payload: PaymentPayload | null | undefined): Promise<VerifyResult> {
  if (!payload || !payload.txSig) return { ok: false, reason: 'missing_tx' };
  const rpcUrl = process.env.ECHOVAULT_RPC_URL;
  if (!rpcUrl) return { ok: false, reason: 'rpc_not_configured' };

  const mint = payload.mint || process.env.ECHOVAULT_PAYMENT_MINT || 'USDC';
  const amount = payload.amount ? Number(payload.amount) : null;

  const rpc = async (body: unknown) => {
    const res = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return res.json() as Promise<any>;
  };

  try {
    const statusJson = await rpc({
      jsonrpc: '2.0',
      id: 1,
      method: 'getSignatureStatuses',
      params: [[payload.txSig]]
    });
    const status = statusJson?.result?.value?.[0];
    if (!status) return { ok: false, reason: 'tx_not_found' };

    const txJson = await rpc({
      jsonrpc: '2.0',
      id: 2,
      method: 'getTransaction',
      params: [payload.txSig, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }]
    });
    const tx = txJson?.result;
    if (!tx) return { ok: false, reason: 'tx_not_found' };

    const collectInstructions = () => {
      const outer = tx?.transaction?.message?.instructions || [];
      const inner = (tx?.meta?.innerInstructions || []).flatMap((ix: any) => ix.instructions || []);
      return [...outer, ...inner];
    };

    const instructions = collectInstructions();
    const transfers = instructions
      .map((ix: any) => ix?.parsed)
      .filter(Boolean)
      .filter((parsed: any) => {
        const program = parsed?.program || parsed?.programId;
        return program === 'spl-token' || program === 'token' || program === 'spl-token-2022';
      })
      .map((parsed: any) => ({ type: parsed.type, info: parsed.info }))
      .filter((ix: any) => ix.type === 'transfer' || ix.type === 'transferChecked');

    const expectedRecipient = payload.recipient || process.env.ECHOVAULT_PAYMENT_RECIPIENT || null;
    const expectedPayer = payload.payer || process.env.ECHOVAULT_PAYMENT_PAYER || null;

    const accountKeys = (tx?.transaction?.message?.accountKeys || []).map((k: any) =>
      typeof k === 'string' ? k : k?.pubkey
    );
    const tokenBalances = (tx?.meta?.postTokenBalances || []).map((post: any) => {
      const pre = (tx?.meta?.preTokenBalances || []).find((b: any) => b.accountIndex === post.accountIndex);
      const postAmount = Number(post?.uiTokenAmount?.uiAmountString ?? post?.uiTokenAmount?.uiAmount ?? 0);
      const preAmount = Number(pre?.uiTokenAmount?.uiAmountString ?? pre?.uiTokenAmount?.uiAmount ?? 0);
      return {
        accountIndex: post.accountIndex,
        account: accountKeys[post.accountIndex],
        owner: post.owner,
        mint: post.mint,
        delta: postAmount - preAmount
      };
    });

    const matches = transfers.some(({ info }: any) => {
      if (!info) return false;
      if (info.mint && info.mint !== mint) return false;
      const tokenAmount = info.tokenAmount || {};
      const uiAmount = typeof tokenAmount.uiAmount === 'number' ? tokenAmount.uiAmount : Number(tokenAmount.uiAmountString);
      if (!Number.isFinite(uiAmount)) return false;
      if (amount != null && uiAmount + 1e-9 < amount) return false;
      if (expectedRecipient && info.destination && info.destination !== expectedRecipient) return false;
      if (expectedPayer) {
        const authority = info.authority || info.owner || null;
        if (authority && authority !== expectedPayer && info.source !== expectedPayer) return false;
      }
      return true;
    }) || tokenBalances.some((bal: any) => {
      if (bal.mint !== mint) return false;
      if (amount != null && bal.delta + 1e-9 < amount) return false;
      if (expectedRecipient && bal.account !== expectedRecipient && bal.owner !== expectedRecipient) return false;
      if (expectedPayer && bal.owner !== expectedPayer && bal.account !== expectedPayer) return false;
      return true;
    });

    if (!matches) {
      const anyRecipient = transfers.some(({ info }: any) => info?.destination === expectedRecipient)
        || tokenBalances.some((bal: any) => bal.account === expectedRecipient || bal.owner === expectedRecipient);
      const anyPayer = transfers.some(({ info }: any) => {
        const authority = info?.authority || info?.owner || null;
        return authority === expectedPayer || info?.source === expectedPayer;
      }) || tokenBalances.some((bal: any) => bal.account === expectedPayer || bal.owner === expectedPayer || bal.delta < 0);
      if (expectedRecipient && !anyRecipient) return { ok: false, reason: 'recipient_mismatch' };
      if (expectedPayer && !anyPayer) return { ok: false, reason: 'payer_mismatch' };
      return { ok: false, reason: 'mint_amount_mismatch' };
    }
  } catch {
    return { ok: false, reason: 'rpc_error' };
  }

  return { ok: true, reason: 'mint_amount_verified', mint };
}

type Challenge = {
  status: 402;
  required: true;
  amount: number;
  mint: string;
  paymentUrl: string;
  feeBps?: number;
  feeRecipient?: string | null;
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
  feeRecipient?: string;
  feeAmount?: string | number;
};

export function build402Challenge({ amount, mint }: { amount: number; mint: string }): Challenge {
  const feeBps = Number(process.env.ECHOVAULT_FEE_BPS ?? 200);
  const feeRecipient = process.env.ECHOVAULT_FEE_RECIPIENT || null;
  return {
    status: 402,
    required: true,
    amount,
    mint,
    paymentUrl: '/pay',
    feeBps: Number.isFinite(feeBps) ? feeBps : undefined,
    feeRecipient
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

    const feeBps = Number(process.env.ECHOVAULT_FEE_BPS ?? 200);
    const expectedRecipient = payload.recipient || process.env.ECHOVAULT_PAYMENT_RECIPIENT || null;
    const expectedFeeRecipient = payload.feeRecipient || process.env.ECHOVAULT_FEE_RECIPIENT || null;
    const expectedPayer = payload.payer || process.env.ECHOVAULT_PAYMENT_PAYER || null;
    const expectedFeeAmount = payload.feeAmount
      ? Number(payload.feeAmount)
      : amount != null && Number.isFinite(feeBps)
        ? Number(((amount * feeBps) / 10000).toFixed(9))
        : null;

    if (!expectedRecipient) return { ok: false, reason: 'recipient_missing' };
    if (feeBps > 0 && !expectedFeeRecipient) return { ok: false, reason: 'fee_recipient_missing' };

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

    const transferTotals = transfers.reduce<Record<string, number>>((acc, { info }: any) => {
      if (!info) return acc;
      if (info.mint && info.mint !== mint) return acc;
      const tokenAmount = info.tokenAmount || {};
      const uiAmount = typeof tokenAmount.uiAmount === 'number' ? tokenAmount.uiAmount : Number(tokenAmount.uiAmountString);
      if (!Number.isFinite(uiAmount)) return acc;
      if (!info.destination) return acc;
      acc[info.destination] = (acc[info.destination] ?? 0) + uiAmount;
      return acc;
    }, {});

    const balanceTotals = tokenBalances.reduce<Record<string, number>>((acc, bal: any) => {
      if (bal.mint !== mint) return acc;
      if (!Number.isFinite(bal.delta) || bal.delta <= 0) return acc;
      if (!bal.account) return acc;
      acc[bal.account] = (acc[bal.account] ?? 0) + bal.delta;
      return acc;
    }, {});

    const getPaid = (address: string | null) => {
      if (!address) return 0;
      if (transferTotals[address] !== undefined) return transferTotals[address];
      return balanceTotals[address] ?? 0;
    };

    const paidToRecipient = getPaid(expectedRecipient);
    const paidToFee = expectedFeeRecipient ? getPaid(expectedFeeRecipient) : 0;
    const totalPaid = paidToRecipient + paidToFee;

    if (amount != null && totalPaid + 1e-9 < amount) return { ok: false, reason: 'mint_amount_mismatch' };
    if (expectedFeeAmount != null && expectedFeeRecipient) {
      if (paidToFee + 1e-9 < expectedFeeAmount) return { ok: false, reason: 'fee_mismatch' };
    }
    if (amount != null && expectedFeeAmount != null) {
      const expectedProviderAmount = amount - expectedFeeAmount;
      if (paidToRecipient + 1e-9 < expectedProviderAmount) return { ok: false, reason: 'recipient_mismatch' };
    }

    const anyPayer = transfers.some(({ info }: any) => {
      const authority = info?.authority || info?.owner || null;
      return authority === expectedPayer || info?.source === expectedPayer;
    }) || tokenBalances.some((bal: any) => bal.account === expectedPayer || bal.owner === expectedPayer || bal.delta < 0);
    if (expectedPayer && !anyPayer) return { ok: false, reason: 'payer_mismatch' };
  } catch {
    return { ok: false, reason: 'rpc_error' };
  }

  return { ok: true, reason: 'mint_amount_verified', mint };
}

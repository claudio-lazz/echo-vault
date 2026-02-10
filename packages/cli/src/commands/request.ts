import { Command } from 'commander';
import { postJson } from '../http';
import { getApi, logResult, ApiError } from '../utils';

function registerRequest(program: Command) {
  program
    .command('request')
    .description('Request context (dev stub)')
    .action(async () => {
      const api = getApi();
      const txSig = process.env.ECHOVAULT_PAYMENT_TX;
      const mint = process.env.ECHOVAULT_PAYMENT_MINT || 'USDC';
      const amount = process.env.ECHOVAULT_PAYMENT_AMOUNT || '0.001';
      const payer = process.env.ECHOVAULT_PAYMENT_PAYER;
      const recipient = process.env.ECHOVAULT_PAYMENT_RECIPIENT;
      const owner = process.env.ECHOVAULT_OWNER || 'OWNER';
      const grantee = process.env.ECHOVAULT_GRANTEE || 'GRANTEE';
      const scope_hash = process.env.ECHOVAULT_SCOPE_HASH || 'SCOPE_HASH';
      const payment: Record<string, string> | null = txSig ? { txSig, mint, amount } : null;
      if (payment && payer) payment.payer = payer;
      if (payment && recipient) payment.recipient = recipient;
      const body = payment ? { owner, grantee, scope_hash, payment } : { owner, grantee, scope_hash };
      const result = await postJson<ApiError>(`${api}/context/request`, body);
      logResult(result);
    });
}

export { registerRequest };

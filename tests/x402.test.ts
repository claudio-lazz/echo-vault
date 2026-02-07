import { describe, it, expect, vi } from 'vitest';
import { verify402Payment } from '../packages/api/src/x402';

describe('x402 verify', () => {
  it('returns missing_tx when no txSig', async () => {
    const res = await verify402Payment({});
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toBe('missing_tx');
  });

  it('returns rpc_not_configured when no rpc url', async () => {
    const res = await verify402Payment({ txSig: 'TX' });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toBe('rpc_not_configured');
  });

  it('accepts matching transfer', async () => {
    process.env.ECHOVAULT_RPC_URL = 'http://localhost:8899';
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ json: async () => ({ result: { value: [ { confirmationStatus: 'confirmed' } ] } }) })
      .mockResolvedValueOnce({ json: async () => ({ result: { transaction: { message: { instructions: [ { parsed: { program: 'spl-token', type: 'transfer', info: { mint: 'USDC', tokenAmount: { uiAmount: 0.001 }, destination: 'DEST', source: 'SRC' } } } ] } }, meta: { innerInstructions: [] } } }) });
    // @ts-expect-error override
    global.fetch = mockFetch;

    const res = await verify402Payment({ txSig: 'TX', mint: 'USDC', amount: '0.001', recipient: 'DEST', payer: 'SRC' });
    expect(res.ok).toBe(true);

    delete process.env.ECHOVAULT_RPC_URL;
  });
});

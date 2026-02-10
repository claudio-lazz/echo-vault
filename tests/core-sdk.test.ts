import { describe, it, expect } from 'vitest';
import { encryptBlob, decryptBlob } from '../packages/core-sdk/src/crypto';
import { unwrapOrThrow } from '../packages/core-sdk/src/index';

describe('core-sdk crypto', () => {
  it('encrypts and decrypts payload', () => {
    const secret = 'test-secret';
    const plaintext = JSON.stringify({ hello: 'world' });
    const encrypted = encryptBlob({ plaintext, secret });
    const decrypted = decryptBlob({ secret, ...encrypted });
    expect(decrypted).toBe(plaintext);
  });

  it('throws on wrong secret', () => {
    const encrypted = encryptBlob({ plaintext: 'hello', secret: 'secret-a' });
    expect(() => decryptBlob({ secret: 'secret-b', ...encrypted })).toThrow();
  });
});

describe('core-sdk unwrapOrThrow', () => {
  it('throws on non-ok', () => {
    expect(() => unwrapOrThrow({ ok: false, status: 400, json: { code: 'bad' } })).toThrow('bad');
  });
  it('attaches status and payload on errors', () => {
    try {
      unwrapOrThrow({ ok: false, status: 402, json: { code: 'payment_required', detail: 'missing tx' } });
    } catch (err) {
      const error = err as Error & { status?: number; payload?: unknown };
      expect(error.status).toBe(402);
      expect(error.payload).toEqual({ code: 'payment_required', detail: 'missing tx' });
      return;
    }
    throw new Error('expected unwrapOrThrow to throw');
  });
  it('throws using reason when code missing', () => {
    expect(() => unwrapOrThrow({ ok: false, status: 400, json: { reason: 'nope' } })).toThrow('nope');
  });
  it('returns json on ok', () => {
    expect(unwrapOrThrow({ ok: true, status: 200, json: { ok: true } })).toEqual({ ok: true });
  });
});

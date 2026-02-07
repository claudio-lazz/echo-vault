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
});

describe('core-sdk unwrapOrThrow', () => {
  it('throws on non-ok', () => {
    expect(() => unwrapOrThrow({ ok: false, status: 400, json: { code: 'bad' } })).toThrow('bad');
  });
  it('returns json on ok', () => {
    expect(unwrapOrThrow({ ok: true, status: 200, json: { ok: true } })).toEqual({ ok: true });
  });
});

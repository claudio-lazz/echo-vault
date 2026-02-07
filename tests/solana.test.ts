import { describe, it, expect } from 'vitest';
import { parseScopeHash } from '../packages/api/src/solana';

const hex = 'a'.repeat(64);

describe('solana helpers', () => {
  it('parses hex scope hash', () => {
    const buf = parseScopeHash(hex);
    expect(buf).not.toBeNull();
    expect(buf?.length).toBe(32);
  });

  it('parses 0x hex scope hash', () => {
    const buf = parseScopeHash('0x' + hex);
    expect(buf).not.toBeNull();
  });

  it('rejects bad scope hash', () => {
    const buf = parseScopeHash('not-a-hash');
    expect(buf).toBeNull();
  });
});

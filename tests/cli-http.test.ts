import { describe, it, expect, vi } from 'vitest';
import { postJson, getJson } from '../packages/cli/src/http';

describe('cli http helpers', () => {
  it('postJson uses fetch and returns status/json', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ ok: true })
    });
    // @ts-expect-error override
    global.fetch = mockFetch;
    const res = await postJson('http://localhost/test', { a: 1 });
    expect(res.status).toBe(200);
    expect(res.json).toEqual({ ok: true });
    expect(mockFetch).toHaveBeenCalled();
  });

  it('getJson uses fetch and returns status/json', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      status: 404,
      json: async () => ({ code: 'not_found' })
    });
    // @ts-expect-error override
    global.fetch = mockFetch;
    const res = await getJson('http://localhost/test');
    expect(res.status).toBe(404);
    expect(res.json).toEqual({ code: 'not_found' });
  });
});

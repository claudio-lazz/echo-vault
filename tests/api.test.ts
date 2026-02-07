import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../packages/api/src/index';

let server: any;

beforeAll(async () => {
  server = app.listen(0);
});

afterAll(async () => {
  server?.close();
});

describe('api basic flow', () => {
  it('init/grant/preview/request/revoke works', async () => {
    const owner = 'OWNER_TEST';
    const grantee = 'GRANTEE_TEST';
    const scope_hash = 'SCOPE_TEST';

    const initRes = await request(server)
      .post('/vault/init')
      .send({ owner, context_uri: 'ipfs://test', encrypted_blob: { data: 'blob' } });
    expect(initRes.status).toBe(200);

    const grantRes = await request(server)
      .post('/vault/grant')
      .send({ owner, grantee, scope_hash, expires_at: Math.floor(Date.now() / 1000) + 60 });
    expect(grantRes.status).toBe(200);

    const previewRes = await request(server)
      .post('/context/preview')
      .send({ owner, grantee, scope_hash });
    expect(previewRes.status).toBe(200);

    const challengeRes = await request(server)
      .post('/context/request')
      .send({ owner, grantee, scope_hash });
    expect(challengeRes.status).toBe(402);

    const missingTxRes = await request(server)
      .post('/context/request')
      .send({ owner, grantee, scope_hash, payment: { amount: '0.001' } });
    expect(missingTxRes.status).toBe(400);

    const revokeRes = await request(server)
      .post('/vault/revoke')
      .send({ owner, grantee, scope_hash });
    expect(revokeRes.status).toBe(200);

    const revokedReq = await request(server)
      .post('/context/request')
      .send({ owner, grantee, scope_hash });
    expect(revokedReq.status).toBe(403);
  });
});

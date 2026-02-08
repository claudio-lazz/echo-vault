import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import fs from 'fs';
import path from 'path';

let server: any;
let app: any;

const storePath = path.join(process.cwd(), 'echovault-store.test.json');

beforeAll(async () => {
  process.env.ECHOVAULT_STORE_PATH = storePath;
  const mod = await import('../packages/api/src/index');
  app = mod.app;
  server = app.listen(0);
});

beforeEach(async () => {
  await request(server).post('/dev/reset').send({});
  if (fs.existsSync(storePath)) fs.unlinkSync(storePath);
  delete process.env.ECHOVAULT_ONCHAIN_STRICT;
  delete process.env.ECHOVAULT_STORAGE_DIR;
});

afterAll(async () => {
  server?.close();
  if (fs.existsSync(storePath)) fs.unlinkSync(storePath);
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

  it('filters grants by status and returns summary counts', async () => {
    const owner = 'OWNER_STATUS';
    const grantee = 'GRANTEE_STATUS';

    await request(server)
      .post('/vault/grant')
      .send({ owner, grantee, scope_hash: 'SCOPE_ACTIVE', expires_at: Math.floor(Date.now() / 1000) + 600 });

    await request(server)
      .post('/vault/grant')
      .send({ owner, grantee, scope_hash: 'SCOPE_REVOKED', expires_at: Math.floor(Date.now() / 1000) + 600 });

    await request(server)
      .post('/vault/grant')
      .send({ owner, grantee, scope_hash: 'SCOPE_EXPIRED', expires_at: Math.floor(Date.now() / 1000) - 10 });

    await request(server)
      .post('/vault/revoke')
      .send({ owner, grantee, scope_hash: 'SCOPE_REVOKED' });

    const activeRes = await request(server)
      .get('/vault/grants')
      .query({ owner, status: 'active' });
    expect(activeRes.status).toBe(200);
    expect(activeRes.body?.grants?.length).toBe(1);
    expect(activeRes.body?.grants?.[0]?.scope_hash).toBe('SCOPE_ACTIVE');

    const revokedRes = await request(server)
      .get('/vault/grants')
      .query({ owner, status: 'revoked' });
    expect(revokedRes.status).toBe(200);
    expect(revokedRes.body?.grants?.length).toBe(1);
    expect(revokedRes.body?.grants?.[0]?.scope_hash).toBe('SCOPE_REVOKED');

    const expiredRes = await request(server)
      .get('/vault/grants')
      .query({ owner, status: 'expired' });
    expect(expiredRes.status).toBe(200);
    expect(expiredRes.body?.grants?.length).toBe(1);
    expect(expiredRes.body?.grants?.[0]?.scope_hash).toBe('SCOPE_EXPIRED');

    const summaryRes = await request(server)
      .get('/vault/grants/summary')
      .query({ owner });
    expect(summaryRes.status).toBe(200);
    expect(summaryRes.body?.counts?.active).toBe(1);
    expect(summaryRes.body?.counts?.revoked).toBe(1);
    expect(summaryRes.body?.counts?.expired).toBe(1);
  });

  it('lists vaults with grant summaries', async () => {
    await request(server)
      .post('/vault/init')
      .send({ owner: 'OWNER_A', context_uri: 'ipfs://a', encrypted_blob: { ok: true } });

    await request(server)
      .post('/vault/init')
      .send({ owner: 'OWNER_B', context_uri: 'ipfs://b', encrypted_blob: { ok: true } });

    await request(server)
      .post('/vault/grant')
      .send({ owner: 'OWNER_A', grantee: 'GRANTEE', scope_hash: 'SCOPE_ACTIVE', expires_at: Math.floor(Date.now() / 1000) + 600 });

    await request(server)
      .post('/vault/grant')
      .send({ owner: 'OWNER_A', grantee: 'GRANTEE', scope_hash: 'SCOPE_REVOKED', expires_at: Math.floor(Date.now() / 1000) + 600 });

    await request(server)
      .post('/vault/revoke')
      .send({ owner: 'OWNER_A', grantee: 'GRANTEE', scope_hash: 'SCOPE_REVOKED' });

    const listRes = await request(server).get('/vaults');
    expect(listRes.status).toBe(200);
    expect(listRes.body?.vaults?.length).toBe(2);

    const ownerA = listRes.body?.vaults?.find((vault: any) => vault.owner === 'OWNER_A');
    expect(ownerA?.grants?.total).toBe(2);
    expect(ownerA?.grants?.counts?.active).toBe(1);
    expect(ownerA?.grants?.counts?.revoked).toBe(1);

    const ownerB = listRes.body?.vaults?.find((vault: any) => vault.owner === 'OWNER_B');
    expect(ownerB?.grants?.total).toBe(0);

    const filteredRes = await request(server).get('/vaults').query({ owner: 'OWNER_A' });
    expect(filteredRes.status).toBe(200);
    expect(filteredRes.body?.vaults?.length).toBe(1);
    expect(filteredRes.body?.vaults?.[0]?.owner).toBe('OWNER_A');
  });

  it('records audit events with filters', async () => {
    const owner = 'OWNER_AUDIT';
    const grantee = 'GRANTEE_AUDIT';
    const scope_hash = 'SCOPE_AUDIT';

    await request(server)
      .post('/vault/init')
      .send({ owner, context_uri: 'ipfs://audit', encrypted_blob: { ok: true } });

    await request(server)
      .post('/vault/grant')
      .send({ owner, grantee, scope_hash, expires_at: Math.floor(Date.now() / 1000) + 600 });

    await request(server)
      .post('/vault/revoke')
      .send({ owner, grantee, scope_hash });

    const auditRes = await request(server).get('/audit').query({ owner });
    expect(auditRes.status).toBe(200);
    expect(auditRes.body?.events?.length).toBeGreaterThanOrEqual(3);
    expect(auditRes.body?.events?.[0]?.action).toBe('revoke');

    const grantRes = await request(server).get('/audit').query({ owner, action: 'grant' });
    expect(grantRes.status).toBe(200);
    expect(grantRes.body?.events?.length).toBe(1);
    expect(grantRes.body?.events?.[0]?.action).toBe('grant');
  });

  it('validates missing fields', async () => {
    const initRes = await request(server).post('/vault/init').send({ owner: 'O' });
    expect(initRes.status).toBe(400);

    const grantRes = await request(server).post('/vault/grant').send({ owner: 'O' });
    expect(grantRes.status).toBe(400);

    const revokeRes = await request(server).post('/vault/revoke').send({});
    expect(revokeRes.status).toBe(400);
  });

  it('enforces strict on-chain mode when not configured', async () => {
    process.env.ECHOVAULT_ONCHAIN_STRICT = 'true';
    const previewRes = await request(server)
      .post('/context/preview')
      .send({ owner: 'O', grantee: 'G', scope_hash: 'S' });
    expect(previewRes.status).toBe(403);
    expect(previewRes.body?.code).toBe('onchain_not_configured');

    const reqRes = await request(server)
      .post('/context/request')
      .send({ owner: 'O', grantee: 'G', scope_hash: 'S' });
    expect(reqRes.status).toBe(403);
    expect(reqRes.body?.code).toBe('onchain_not_configured');
  });

  it('writes blobs to filesystem adapter when configured', async () => {
    const storageDir = path.join(process.cwd(), 'echovault-storage-test');
    process.env.ECHOVAULT_STORAGE_DIR = storageDir;

    const initRes = await request(server)
      .post('/vault/init')
      .send({ owner: 'O', context_uri: 'ipfs://ctx', encrypted_blob: { ok: true } });
    expect(initRes.status).toBe(200);
    expect(initRes.body?.vault?.storage).toContain(storageDir);

    const files = fs.readdirSync(storageDir);
    expect(files.length).toBeGreaterThan(0);
    fs.rmSync(storageDir, { recursive: true, force: true });
  });
});

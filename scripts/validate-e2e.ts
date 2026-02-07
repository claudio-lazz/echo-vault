#!/usr/bin/env node

import { postJson } from '../packages/cli/src/http';

type JsonError = { code?: string };

const api = process.env.ECHOVAULT_API || 'http://localhost:8787';
const owner = process.env.ECHOVAULT_OWNER || 'OWNER';
const grantee = process.env.ECHOVAULT_GRANTEE || 'GRANTEE';
const scope_hash = process.env.ECHOVAULT_SCOPE_HASH || 'SCOPE_HASH';

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error('assert_failed', msg);
    process.exit(1);
  }
}

async function run() {
  console.log('== EchoVault validation ==');

  const badInit = await postJson<JsonError>(`${api}/vault/init`, { owner });
  assert(badInit.status === 400 && badInit.json.code === 'missing_context_uri', 'missing_context_uri');

  const init = await postJson(`${api}/vault/init`, {
    owner,
    context_uri: 'ipfs://encrypted-context-placeholder',
    encrypted_blob: 'ENCRYPTED_BLOB_PLACEHOLDER'
  });
  assert(init.status === 200, 'init_ok');

  const grant = await postJson(`${api}/vault/grant`, {
    owner,
    grantee,
    scope_hash,
    expires_at: Date.now() / 1000 + 60
  });
  assert(grant.status === 200, 'grant_ok');

  const challenge = await postJson(`${api}/context/request`, { owner, grantee, scope_hash });
  assert(challenge.status === 402, 'challenge_402');

  const missingTx = await postJson<JsonError>(`${api}/context/request`, { owner, grantee, scope_hash, payment: { amount: '0.001' } });
  assert(missingTx.status === 400 && missingTx.json.code === 'missing_tx', 'missing_tx');

  const revoke = await postJson(`${api}/vault/revoke`, { owner, grantee, scope_hash });
  assert(revoke.status === 200, 'revoke_ok');

  const revokedReq = await postJson<JsonError>(`${api}/context/request`, { owner, grantee, scope_hash });
  assert(revokedReq.status === 403 && revokedReq.json.code === 'grant_revoked', 'grant_revoked');

  console.log('ok');
}

run().catch((err) => {
  console.error('validation_failed', err);
  process.exit(1);
});

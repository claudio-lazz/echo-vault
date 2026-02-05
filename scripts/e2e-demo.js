#!/usr/bin/env node

const { postJson } = require('../packages/cli/src/http');

const api = process.env.ECHOVAULT_API || 'http://localhost:8787';
const owner = process.env.ECHOVAULT_OWNER || 'OWNER';
const grantee = process.env.ECHOVAULT_GRANTEE || 'GRANTEE';
const scope_hash = process.env.ECHOVAULT_SCOPE_HASH || 'SCOPE_HASH';

async function run() {
  console.log('== EchoVault e2e demo ==');

  console.log('\n1) init vault');
  const init = await postJson(`${api}/vault/init`, {
    owner,
    context_uri: process.env.ECHOVAULT_CONTEXT_URI || 'ipfs://encrypted-context-placeholder',
    encrypted_blob: process.env.ECHOVAULT_ENCRYPTED_BLOB || 'ENCRYPTED_BLOB_PLACEHOLDER'
  });
  console.log(init.status, init.json);

  console.log('\n2) grant access');
  const grant = await postJson(`${api}/vault/grant`, {
    owner,
    grantee,
    scope_hash,
    expires_at: Date.now() / 1000 + 3600
  });
  console.log(grant.status, grant.json);

  console.log('\n3) request without payment (expect 402)');
  const challenge = await postJson(`${api}/context/request`, { owner, grantee, scope_hash });
  console.log(challenge.status, challenge.json);

  if (process.env.ECHOVAULT_PAYMENT_TX) {
    console.log('\n4) request with payment');
    const payment = {
      txSig: process.env.ECHOVAULT_PAYMENT_TX,
      mint: process.env.ECHOVAULT_PAYMENT_MINT || 'USDC',
      amount: process.env.ECHOVAULT_PAYMENT_AMOUNT || '0.001'
    };
    const paid = await postJson(`${api}/context/request`, { owner, grantee, scope_hash, payment });
    console.log(paid.status, paid.json);
  } else {
    console.log('\n4) skip paid request (set ECHOVAULT_PAYMENT_TX to test)');
  }

  console.log('\n5) revoke + request (expect grant_revoked)');
  const revoke = await postJson(`${api}/vault/revoke`, { owner, grantee, scope_hash });
  console.log(revoke.status, revoke.json);
  const revokedReq = await postJson(`${api}/context/request`, { owner, grantee, scope_hash });
  console.log(revokedReq.status, revokedReq.json);
}

run().catch((err) => {
  console.error('demo_failed', err);
  process.exit(1);
});

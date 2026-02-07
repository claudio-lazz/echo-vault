#!/usr/bin/env node

import { encryptBlob, decryptBlobPayload } from '../packages/core-sdk/src/crypto';

type JsonResult<T = unknown> = { status: number; json: T };

type EncryptedPayload = {
  ciphertext: string;
  iv: string;
  tag: string;
  algorithm: 'aes-256-gcm';
};

async function postJson<T = unknown>(url: string, body?: unknown): Promise<JsonResult<T>> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {})
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json: json as T };
}

async function run() {
  const api = process.env.ECHOVAULT_API || 'http://localhost:8787';
  const secret = process.env.ECHOVAULT_SECRET || 'dev-secret';

  const owner = process.env.ECHOVAULT_OWNER || 'OWNER';
  const grantee = process.env.ECHOVAULT_GRANTEE || 'GRANTEE';
  const scope_hash = process.env.ECHOVAULT_SCOPE_HASH || 'SCOPE_HASH';

  const plaintext = JSON.stringify({ hello: 'world' });
  const encrypted = encryptBlob({ plaintext, secret });

  console.log('init vault');
  const init = await postJson(`${api}/vault/init`, {
    owner,
    context_uri: 'ipfs://encrypted-context-placeholder',
    encrypted_blob: encrypted
  });
  console.log(init.status, init.json);

  console.log('grant');
  const grant = await postJson(`${api}/vault/grant`, { owner, grantee, scope_hash, expires_at: Math.floor(Date.now() / 1000) + 3600 });
  console.log(grant.status, grant.json);

  console.log('request (expect 402)');
  const request = await postJson(`${api}/context/request`, { owner, grantee, scope_hash });
  console.log(request.status, request.json);

  console.log('request with stub payment');
  const paid = await postJson<{ encrypted_blob?: EncryptedPayload }>(`${api}/context/request`, {
    owner,
    grantee,
    scope_hash,
    payment: { txSig: process.env.ECHOVAULT_PAYMENT_TX || 'TX_SIG', mint: 'USDC', amount: '0.001' }
  });
  console.log(paid.status, paid.json);

  if (paid?.json?.encrypted_blob) {
    try {
      const decrypted = decryptBlobPayload({ secret, ...paid.json.encrypted_blob });
      console.log('decrypted', decrypted);
    } catch (e) {
      const err = e as Error;
      console.warn('decrypt_failed', err.message);
    }
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

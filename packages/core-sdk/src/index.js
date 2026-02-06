// EchoVault SDK (minimal)

const defaultApi = process.env.ECHOVAULT_API || 'http://localhost:8787';

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {})
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

async function initVault({ owner, context_uri, encrypted_blob, api = defaultApi }) {
  return postJson(`${api}/vault/init`, { owner, context_uri, encrypted_blob });
}

async function grantAccess({ owner, grantee, scope_hash, expires_at, api = defaultApi }) {
  return postJson(`${api}/vault/grant`, { owner, grantee, scope_hash, expires_at });
}

async function revokeAccess({ owner, grantee, scope_hash, api = defaultApi }) {
  return postJson(`${api}/vault/revoke`, { owner, grantee, scope_hash });
}

async function previewContext({ owner, grantee, scope_hash, api = defaultApi }) {
  return postJson(`${api}/context/preview`, { owner, grantee, scope_hash });
}

async function requestContext({ owner, grantee, scope_hash, payment, api = defaultApi }) {
  return postJson(`${api}/context/request`, { owner, grantee, scope_hash, payment });
}

async function fetchContext({ owner, grantee, scope_hash, payment, api = defaultApi }) {
  const result = await requestContext({ owner, grantee, scope_hash, payment, api });
  return unwrapOrThrow(result);
}

function decryptBlob({ encrypted_blob, decryptor }) {
  if (typeof decryptor === 'function') return decryptor(encrypted_blob);
  return encrypted_blob;
}

const { encryptBlob, decryptBlob: decryptBlobPayload } = require('./crypto');

function unwrapOrThrow(result) {
  if (!result?.ok) {
    const code = result?.json?.code || result?.json?.reason || 'request_failed';
    const err = new Error(code);
    err.code = code;
    err.status = result?.status;
    err.payload = result?.json;
    throw err;
  }
  return result.json;
}

module.exports = {
  initVault,
  grantAccess,
  revokeAccess,
  previewContext,
  requestContext,
  fetchContext,
  decryptBlob,
  encryptBlob,
  decryptBlobPayload,
  unwrapOrThrow
};

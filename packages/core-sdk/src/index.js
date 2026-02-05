// EchoVault SDK (minimal)

const defaultApi = process.env.ECHOVAULT_API || 'http://localhost:8787';

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {})
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

async function initVault({ owner, context_uri, api = defaultApi }) {
  return postJson(`${api}/vault/init`, { owner, context_uri });
}

async function grantAccess({ owner, grantee, scope_hash, expires_at, api = defaultApi }) {
  return postJson(`${api}/vault/grant`, { owner, grantee, scope_hash, expires_at });
}

async function requestContext({ owner, grantee, scope_hash, payment, api = defaultApi }) {
  return postJson(`${api}/context/request`, { owner, grantee, scope_hash, payment });
}

module.exports = { initVault, grantAccess, requestContext };

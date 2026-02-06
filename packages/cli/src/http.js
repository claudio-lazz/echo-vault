const fetch = global.fetch || ((...args) => import('node-fetch').then(({default: f}) => f(...args)));

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {})
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

async function getJson(url) {
  const res = await fetch(url);
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

module.exports = { postJson, getJson };

#!/usr/bin/env node

const { postJson } = require('./http');
const cmd = process.argv[2];
const api = process.env.ECHOVAULT_API || 'http://localhost:8787';

if (!cmd) {
  console.log('echovault <init|grant|request>');
  process.exit(0);
}

(async () => {
  if (cmd === 'init') {
    const { status, json } = await postJson(`${api}/vault/init`, { owner: 'OWNER', context_uri: 'ipfs://...' });
    console.log(status, json);
  } else if (cmd === 'grant') {
    const { status, json } = await postJson(`${api}/vault/grant`, { owner: 'OWNER', grantee: 'GRANTEE', scope_hash: 'HASH', expires_at: Date.now()/1000 });
    console.log(status, json);
  } else if (cmd === 'request') {
    const txSig = process.env.ECHOVAULT_PAYMENT_TX;
    const body = txSig ? { payment: { txSig } } : {};
    const { status, json } = await postJson(`${api}/context/request`, body);
    console.log(status, json);
  } else {
    console.log('unknown command');
  }
})();

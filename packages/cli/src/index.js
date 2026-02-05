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
    const mint = process.env.ECHOVAULT_PAYMENT_MINT || 'USDC';
    const amount = process.env.ECHOVAULT_PAYMENT_AMOUNT || '0.001';
    const payer = process.env.ECHOVAULT_PAYMENT_PAYER;
    const recipient = process.env.ECHOVAULT_PAYMENT_RECIPIENT;
    const owner = process.env.ECHOVAULT_OWNER || 'OWNER';
    const grantee = process.env.ECHOVAULT_GRANTEE || 'GRANTEE';
    const scope_hash = process.env.ECHOVAULT_SCOPE_HASH || 'SCOPE_HASH';
    const payment = txSig ? { txSig, mint, amount } : null;
    if (payment && payer) payment.payer = payer;
    if (payment && recipient) payment.recipient = recipient;
    const body = payment ? { owner, grantee, scope_hash, payment } : { owner, grantee, scope_hash };
    const { status, json } = await postJson(`${api}/context/request`, body);
    console.log(status, json);
  } else {
    console.log('unknown command');
  }
})();

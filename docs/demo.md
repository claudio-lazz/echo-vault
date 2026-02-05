# EchoVault Demo (Draft)

## Local API
```
cd packages/api
npm install
node src/index.js
```

## CLI
```
# Set API URL
export ECHOVAULT_API=http://localhost:8787

# Init vault (stub)
export ECHOVAULT_CONTEXT_URI=ipfs://encrypted-context-placeholder
export ECHOVAULT_ENCRYPTED_BLOB=ENCRYPTED_BLOB_PLACEHOLDER

echovault init

# Grant access (stub)
export ECHOVAULT_OWNER=OWNER
export ECHOVAULT_GRANTEE=GRANTEE
export ECHOVAULT_SCOPE_HASH=SCOPE_HASH

# Grant stores in-memory grant
echovault grant

# Optional: revoke grant
echovault revoke

# Request context (returns 402 challenge)
echovault request

# Provide payment tx signature (stub)
export ECHOVAULT_PAYMENT_TX=TX_SIG
export ECHOVAULT_PAYMENT_MINT=USDC
export ECHOVAULT_PAYMENT_AMOUNT=0.001
# Optional: enforce payer/recipient validation
export ECHOVAULT_PAYMENT_PAYER=PAYER_PUBKEY
export ECHOVAULT_PAYMENT_RECIPIENT=RECIPIENT_TOKEN_ACCOUNT

echovault request
```

## SDK (minimal)
```js
const { grantAccess, requestContext } = require('@echovault/core-sdk');

const api = 'http://localhost:8787';
await grantAccess({ owner: 'OWNER', grantee: 'GRANTEE', scope_hash: 'SCOPE_HASH', api });
const res = await requestContext({ owner: 'OWNER', grantee: 'GRANTEE', scope_hash: 'SCOPE_HASH', api });
console.log(res.status, res.json);
```

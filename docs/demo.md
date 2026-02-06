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
# Optional: file-backed dev store
export ECHOVAULT_STORE_PATH=/tmp/echovault-store.json

# Run e2e script (optional)
node scripts/e2e-demo.js
# Run validation script (optional)
node scripts/validate-e2e.js

# Reset dev store (optional)
curl -X POST http://localhost:8787/dev/reset

# Check dev status counts
echovault status

# Init vault (stub)
export ECHOVAULT_CONTEXT_URI=ipfs://encrypted-context-placeholder
export ECHOVAULT_ENCRYPTED_BLOB=ENCRYPTED_BLOB_PLACEHOLDER

# Optional: enable filesystem storage adapter
export ECHOVAULT_STORAGE_DIR=./echovault-storage

# Optional: enforce on-chain validation (requires RPC + program id)
export ECHOVAULT_ONCHAIN_RPC=https://api.devnet.solana.com
export ECHOVAULT_PROGRAM_ID=Ech0VaulT11111111111111111111111111111111
export ECHOVAULT_ONCHAIN_STRICT=true

# Encrypt a blob locally (writes JSON to stdout)
export ECHOVAULT_SECRET=dev-secret
node scripts/encrypt-blob.js '{"hello":"world"}' > /tmp/echovault-encrypted.json

# Use encrypted blob for init
export ECHOVAULT_ENCRYPTED_BLOB=$(cat /tmp/echovault-encrypted.json)

# End-to-end demo with encryption
node scripts/e2e-encrypt-demo.js

echovault init

# Grant access (stub)
export ECHOVAULT_OWNER=OWNER
export ECHOVAULT_GRANTEE=GRANTEE
export ECHOVAULT_SCOPE_HASH=SCOPE_HASH

# Grant stores in-memory grant
echovault grant

# Optional: revoke grant
echovault revoke

# Preview context (metadata only)
echovault preview

# Request context (returns 402 challenge)
echovault request

# If revoked, request will return grant_revoked

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
const {
  grantAccess,
  revokeAccess,
  previewContext,
  requestContext,
  fetchContext,
  decryptBlob,
  encryptBlob,
  decryptBlobPayload,
  unwrapOrThrow
} = require('@echovault/core-sdk');

const api = 'http://localhost:8787';
const grant = await grantAccess({ owner: 'OWNER', grantee: 'GRANTEE', scope_hash: 'SCOPE_HASH', api });
console.log('grant', grant.status, grant.json);

const preview = await previewContext({ owner: 'OWNER', grantee: 'GRANTEE', scope_hash: 'SCOPE_HASH', api });
console.log('preview', preview.status, preview.json);

// Example: encrypt locally before init
const secret = process.env.ECHOVAULT_SECRET || 'dev-secret';
const encrypted = encryptBlob({ plaintext: JSON.stringify({ hello: 'world' }), secret });
// pass encrypted to /vault/init as encrypted_blob

// Optional: revoke grant and observe error handling
await revokeAccess({ owner: 'OWNER', grantee: 'GRANTEE', scope_hash: 'SCOPE_HASH', api });

try {
  const res = await requestContext({ owner: 'OWNER', grantee: 'GRANTEE', scope_hash: 'SCOPE_HASH', api });
  console.log('request', res.status, res.json);
  // or throw on errors:
  // const payload = unwrapOrThrow(res);

  // helper path: fetch + decrypt
  // const payload = await fetchContext({ owner: 'OWNER', grantee: 'GRANTEE', scope_hash: 'SCOPE_HASH', api, payment: { txSig: 'TX_SIG', mint: 'USDC', amount: '0.001' } });
  // const plaintext = decryptBlobPayload({ secret, ...payload.encrypted_blob });
  // const fallback = decryptBlob({ encrypted_blob: payload.encrypted_blob, decryptor: (blob) => blob });
} catch (e) {
  console.error('request failed', e.code, e.status);
}
```

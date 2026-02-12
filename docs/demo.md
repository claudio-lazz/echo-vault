# EchoVault Demo (Draft)

## One-shot recording helper
```bash
# Start API, run encrypted demo, save logs to demo-output/
./scripts/demo-record.sh

# Optional knobs
# DEMO_OUTPUT_DIR=/tmp/ev-demo KEEP_API=true ./scripts/demo-record.sh
```

## Local API
```bash
cd packages/api
npm install
npx tsx src/index.ts
```

## Demo web
```bash
# from repo root
npm install
VITE_ECHOVAULT_API=http://localhost:8787 npm run dev -- --filter demo-web
```
Notes:
- If live grants return zero, the UI falls back to sample data while the API warms up.

## CLI
```bash
# Set API URL
export ECHOVAULT_API=http://localhost:8787
# Optional: file-backed dev store
export ECHOVAULT_STORE_PATH=/tmp/echovault-store.json

# Run e2e script (optional)
npx tsx scripts/e2e-demo.ts
# Run validation script (optional)
npx tsx scripts/validate-e2e.ts

# Reset dev store (optional, dev store only)
ECHOVAULT_RESET_OK=yes npx echovault reset

# Check dev status counts
npx echovault status

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
npx tsx scripts/encrypt-blob.ts '{"hello":"world"}' > /tmp/echovault-encrypted.json

# Use encrypted blob for init
export ECHOVAULT_ENCRYPTED_BLOB=$(cat /tmp/echovault-encrypted.json)

# End-to-end demo with encryption
npx tsx scripts/e2e-encrypt-demo.ts

# If echovault isn't installed globally, prefix with npx
npx echovault init

# Grant access (stub)
export ECHOVAULT_OWNER=OWNER
export ECHOVAULT_GRANTEE=GRANTEE
export ECHOVAULT_SCOPE_HASH=SCOPE_HASH

# Grants are stored in-memory (dev)
npx echovault grant

# Optional: revoke grant
npx echovault revoke

# Preview context (metadata only)
npx echovault preview

# Request context (returns 402 challenge)
npx echovault request

# If revoked, request will return grant_revoked

# Provide payment tx signature (stub)
export ECHOVAULT_PAYMENT_TX=TX_SIG
export ECHOVAULT_PAYMENT_MINT=USDC
export ECHOVAULT_PAYMENT_AMOUNT=0.001
# Optional: enforce payer/recipient validation
export ECHOVAULT_PAYMENT_PAYER=PAYER_PUBKEY
export ECHOVAULT_PAYMENT_RECIPIENT=RECIPIENT_TOKEN_ACCOUNT

npx echovault request
```

## SDK (minimal)
```js
const {
  grantAccess,
  revokeAccess,
  listGrants,
  grantSummary,
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

const grants = await listGrants({ owner: 'OWNER', status: 'active', api });
console.log('grants', grants.status, grants.json);

const summary = await grantSummary({ owner: 'OWNER', api });
console.log('grant summary', summary.status, summary.json);

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

  // helper path: request + 402 handling + decrypt
  const payload = await fetchContext({
    owner: 'OWNER',
    grantee: 'GRANTEE',
    scope_hash: 'SCOPE_HASH',
    api,
    payment: { txSig: 'TX_SIG', mint: 'USDC', amount: '0.001' }
  });
  const plaintext = decryptBlobPayload({ secret, ...payload.encrypted_blob });
  console.log('plaintext', plaintext);
} catch (e) {
  if (e.status === 402) {
    console.error('payment required', e.payload);
  } else {
    console.error('request failed', e.code, e.status);
  }
}
```

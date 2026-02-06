# EchoVault API (Dev Stub)

Base URL: `http://localhost:8787`

## GET /status
Returns dev store counts.

## On-chain validation (optional)
Set the following env vars to enable read-only on-chain grant validation:
- `ECHOVAULT_ONCHAIN_RPC` — Solana RPC endpoint
- `ECHOVAULT_PROGRAM_ID` — program id (defaults to Ech0VaulT11111111111111111111111111111111)
- `ECHOVAULT_ONCHAIN_STRICT=true` — fail if on-chain grant is missing/invalid or RPC not configured (no dev fallback)

## POST /dev/reset
Clears dev in-memory + persisted store (dangerous).

**Response**
```json
{ "ok": true }
```

**Response**
```json
{
  "ok": true,
  "counts": {
    "vaults": 1,
    "grants": 2,
    "revoked": 0,
    "blobs": 1
  },
  "storePath": "/tmp/echovault-store.json"
}
```

## POST /vault/init
Create or update a vault for an owner.

**Request**
```json
{
  "owner": "OWNER",
  "context_uri": "ipfs://encrypted-context-placeholder",
  "encrypted_blob": "ENCRYPTED_BLOB_PLACEHOLDER"
}
```

**Response**
```json
{
  "ok": true,
  "vault": {
    "owner": "OWNER",
    "context_uri": "ipfs://...",
    "encrypted_blob": "..."
  }
}
```

## GET /vault/:owner
Fetch a vault by owner.

**Response**
```json
{
  "ok": true,
  "vault": {
    "owner": "OWNER",
    "context_uri": "ipfs://...",
    "encrypted_blob": "..."
  }
}
```

## POST /vault/grant
Grant access to a grantee.

**Request**
```json
{
  "owner": "OWNER",
  "grantee": "GRANTEE",
  "scope_hash": "SCOPE_HASH",
  "expires_at": 1730000000
}
```

## POST /vault/revoke
Revoke an access grant.

## GET /vault/grants
List grants (filter by `owner` or `grantee`).

Example:
```
GET /vault/grants?owner=OWNER
```

**Response**
```json
{
  "ok": true,
  "grants": [
    {
      "owner": "OWNER",
      "grantee": "GRANTEE",
      "scope_hash": "SCOPE_HASH",
      "expires_at": 1730000000,
      "revoked": false
    }
  ]
}
```

**Request**
```json
{
  "owner": "OWNER",
  "grantee": "GRANTEE",
  "scope_hash": "SCOPE_HASH"
}
```

## POST /context/preview
Returns a metadata-only preview if grant is valid.

**Request**
```json
{
  "owner": "OWNER",
  "grantee": "GRANTEE",
  "scope_hash": "SCOPE_HASH"
}
```

**Response**
```json
{
  "ok": true,
  "preview": {
    "owner": "OWNER",
    "grantee": "GRANTEE",
    "scope_hash": "SCOPE_HASH",
    "context_uri": "ipfs://...",
    "byte_length": 1234
  }
}
```

## POST /context/request
Request context. If payment is required, a 402 is returned.

**Request**
```json
{
  "owner": "OWNER",
  "grantee": "GRANTEE",
  "scope_hash": "SCOPE_HASH",
  "payment": {
    "txSig": "TX_SIG",
    "mint": "USDC",
    "amount": "0.001",
    "payer": "PAYER_PUBKEY",
    "recipient": "RECIPIENT_TOKEN_ACCOUNT"
  }
}
```

**402 Response**
```json
{
  "status": 402,
  "required": true,
  "amount": 0.001,
  "mint": "USDC",
  "paymentUrl": "/pay"
}
```

**200 Response**
```json
{
  "ok": true,
  "context_uri": "ipfs://...",
  "encrypted_blob": "...",
  "meta": {
    "owner": "OWNER",
    "grantee": "GRANTEE",
    "scope_hash": "SCOPE_HASH",
    "payment": {
      "ok": true,
      "reason": "mint_amount_verified",
      "mint": "USDC"
    }
  }
}
```

## SDK Helpers (Dev Stub)
The core SDK wraps these endpoints and provides a few helpers:
- `previewContext` → POST `/context/preview`
- `requestContext` → POST `/context/request`
- `fetchContext` → request + `unwrapOrThrow`
- `decryptBlob` → stub decrypt hook (pass your decryptor)
- `unwrapOrThrow` → throws on non-OK responses

## Error Codes
All 400/403/404/402 error responses include `reason` and `code`.

Common codes:
- `missing_owner`
- `missing_context_uri`
- `missing_encrypted_blob`
- `missing_fields`
- `grant_not_found`
- `grant_revoked`
- `grant_expired`
- `missing_tx`
- `invalid_amount`
- `vault_not_found`

# EchoVault API (Dev Stub)

Base URL: `http://localhost:8787`

## GET /status
Returns dev store counts.

## On-chain validation (optional)
Set the following env vars to enable read-only on-chain grant validation:
- `ECHOVAULT_ONCHAIN_RPC` — Solana RPC endpoint
- `ECHOVAULT_PROGRAM_ID` — program id (defaults to Ech0VaulT11111111111111111111111111111111)
- `ECHOVAULT_ONCHAIN_STRICT=true` — fail if on-chain grant is missing/invalid or RPC not configured (no dev fallback)

## Storage adapter (dev)
By default encrypted blobs are stored in-memory. A filesystem adapter is available:
- `ECHOVAULT_STORAGE_DIR` — path to store encrypted blobs as JSON files (default: `./echovault-storage`)

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

## GET /vaults
List vaults (optional `owner` filter + `limit`/`offset`). Returns grant counts per vault.

Example:
```
GET /vaults?owner=OWNER&limit=25&offset=0
```

**Response**
```json
{
  "ok": true,
  "total": 1,
  "offset": 0,
  "limit": 25,
  "vaults": [
    {
      "owner": "OWNER",
      "context_uri": "ipfs://...",
      "storage": "memory",
      "grants": {
        "total": 2,
        "counts": {
          "active": 1,
          "revoked": 1,
          "expired": 0
        }
      }
    }
  ]
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
List grants (filter by `owner`, `grantee`, `status`, `expires_before`, or `expires_after`). Supports pagination via `limit` and `offset`.

`status` values: `active`, `revoked`, `expired`, `all`.

`expires_before` / `expires_after` are epoch seconds (inclusive) and only match grants with `expires_at` set.

Example:
```
GET /vault/grants?owner=OWNER&status=active&expires_before=1730000000&limit=50&offset=0
```

**Response**
```json
{
  "ok": true,
  "total": 1,
  "offset": 0,
  "limit": 50,
  "grants": [
    {
      "owner": "OWNER",
      "grantee": "GRANTEE",
      "scope_hash": "SCOPE_HASH",
      "expires_at": 1730000000,
      "revoked": false,
      "status": "active"
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

## GET /vault/grants/summary
Summarize grant counts by status (optional `owner`, `grantee`, `expires_before`, `expires_after` filters).

Example:
```
GET /vault/grants/summary?owner=OWNER&expires_before=1730000000
```

**Response**
```json
{
  "ok": true,
  "total": 3,
  "counts": {
    "active": 1,
    "revoked": 1,
    "expired": 1
  }
}
```

## GET /audit
List audit events (optional `owner`, `grantee`, `action`, `limit`, `offset`, `since`, `until`).

`since`/`until` are unix epoch milliseconds, useful for time-windowed audit queries.

Example:
```
GET /audit?action=grant&limit=20&offset=0&since=1730000000000
```

**Response**
```json
{
  "ok": true,
  "total": 1,
  "offset": 0,
  "limit": 20,
  "events": [
    {
      "id": "evt_...",
      "ts": 1730000000000,
      "action": "grant",
      "owner": "OWNER",
      "grantee": "GRANTEE",
      "scope_hash": "SCOPE_HASH",
      "meta": { "expires_at": 1730000000 }
    }
  ]
}
```

## GET /audit/summary
Summarize audit events (optional `owner`, `grantee`, `action`, `since`, `until`).

Example:
```
GET /audit/summary?owner=OWNER
```

**Response**
```json
{
  "ok": true,
  "total": 3,
  "counts": {
    "vault_init": 1,
    "grant": 1,
    "revoke": 1
  },
  "latest": {
    "id": "evt_...",
    "ts": 1730000000000,
    "action": "revoke",
    "owner": "OWNER",
    "grantee": "GRANTEE",
    "scope_hash": "SCOPE_HASH"
  }
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
- `listAudit` → GET `/audit`
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

# EchoVault Spec (v0.1)

## Problem
AI context is siloed and controlled by apps. Users cannot port, own, or monetize their context.

## Solution
Wallet-native, encrypted personal context stored as on-chain assets with permissioned access and revocation. Optional x402 pay-per-read.

## On-chain primitives
- **Context NFT**: metadata pointer to encrypted blob
- **Access Grant PDA**: { owner, grantee, scope, expires_at }
- **Revocation Registry**: { grant_id -> revoked }

## Off-chain services
- **Encryption Gateway**: client-side encryption, store to IPFS/Arweave/S3
- **Context API**: verify grant, return encrypted blob pointer
- **Agent SDK**: request access, fetch, decrypt

## API (dev stub)
- Dev persistence: set `ECHOVAULT_STORE_PATH` to persist vaults/grants/blobs between restarts.
- **POST /vault/init** → `{ owner, context_uri, encrypted_blob }`
- **POST /vault/grant** → `{ owner, grantee, scope_hash, expires_at }`
- **POST /vault/revoke** → `{ owner, grantee, scope_hash }`
- **POST /context/request** → `{ owner, grantee, scope_hash, payment? }`
  - 402 response: `{ status:402, required:true, amount, mint, paymentUrl }`
  - 200 response: `{ ok:true, context_uri, encrypted_blob, meta:{ owner, grantee, scope_hash, payment } }`
  - 403 response: `{ ok:false, reason, code }` where `code` ∈ `grant_revoked|grant_expired|grant_not_found`
  - 400/404/402 errors now include `{ ok:false, reason, code }`

## x402 flow (pay-per-read)
1. Agent requests context
2. API returns 402 + payment request
3. Agent pays
4. API verifies payment tx + grant
5. Context returned

## Demo
- User uploads context
- Agent requests and reads
- (Optional) pays via x402

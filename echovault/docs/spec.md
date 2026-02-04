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
- **Context API**: verify grant, return encrypted blob
- **Agent SDK**: request access, fetch, decrypt

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

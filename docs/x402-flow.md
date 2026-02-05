# x402 Pay‑Per‑Read Flow (Draft)

## Goal
Allow agents to pay per context read using x402, with verification before data is released.

## API Flow
1. **POST /context/request**
   - If no payment attached → return **402** with payment challenge
2. **POST /context/request** with payment payload
   - Verify payment tx (mint, amount, recipient, signature)
   - Verify access grant (owner, grantee, scope, expiry, not revoked)
   - Return encrypted blob pointer + metadata

## Required Fields (payment)
- `txSig`
- `mint`
- `amount`
- `payer` (optional but recommended)
- `recipient` (optional but recommended)

## Verification (server)
- Confirm tx on Solana
- Validate token mint/amount
- Confirm recipient matches EchoVault vault address


# EchoVault On-chain Data Model (Draft)

## Accounts

### ContextVault (PDA)
- `owner`: Pubkey
- `context_uri`: String (encrypted blob pointer)
- `version`: u64
- `created_at`: i64
- `updated_at`: i64

### AccessGrant (PDA)
- `owner`: Pubkey
- `grantee`: Pubkey
- `scope_hash`: [u8; 32] (hash of scopes)
- `expires_at`: i64
- `revoked`: bool
- `created_at`: i64

### RevocationRegistry (PDA)
- `grant`: Pubkey
- `revoked_at`: i64

## Instructions (draft)
- `init_context_vault(owner, context_uri)`
- `update_context_vault(owner, context_uri)`
- `grant_access(owner, grantee, scope_hash, expires_at)`
- `revoke_access(owner, grant)` → creates `RevocationRegistry`

## Tests (WIP)
- `tests/echovault.ts` covers PDA derivation, init/update vault, and grant→revoke smoke flows (Anchor).

## Notes
- Use append-only context events off-chain; on-chain references latest context state.
- Optional payment receipt link (x402) stored off-chain, verified by API.

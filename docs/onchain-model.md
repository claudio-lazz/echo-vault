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

## Notes
- Use append-only context events off-chain; on-chain references latest context state.
- Optional payment receipt link (x402) stored off-chain, verified by API.

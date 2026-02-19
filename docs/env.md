# Environment

## API
- `ECHOVAULT_RPC_URL` — Solana RPC endpoint for tx verification (future)
- `ECHOVAULT_PAYMENT_MINT` — token mint (e.g., USDC) for x402 (future)
- `ECHOVAULT_PAYMENT_RECIPIENT` — expected provider recipient token account (optional)
- `ECHOVAULT_PAYMENT_PAYER` — expected payer authority (optional)
- `ECHOVAULT_FEE_BPS` — protocol fee in basis points (default 200 = 2%)
- `ECHOVAULT_FEE_RECIPIENT` — protocol treasury token account
- `ECHOVAULT_STORE_PATH` — file path for dev persistence store (optional)
- `ECHOVAULT_API` — default API base used by the SDK (optional)

## CLI
- `ECHOVAULT_CLI_DEBUG` — set to `1` to emit debug warnings (e.g., missing/empty env-path files).
- `ECHOVAULT_API` — API base URL override for the CLI (default `http://localhost:8787`).
- `ECHOVAULT_OWNER` — owner public key used by CLI calls.
- `ECHOVAULT_GRANTEE` — grantee public key used by CLI calls.
- `ECHOVAULT_SCOPE_HASH` — scope hash used by grant/preview/request.
- `ECHOVAULT_CONTEXT_URI` — context URI string (CLI `init`).
- `ECHOVAULT_CONTEXT_URI_PATH` — file path containing the context URI (CLI `init`).
- `ECHOVAULT_ENCRYPTED_BLOB` — encrypted blob pointer string (CLI `init`).
- `ECHOVAULT_ENCRYPTED_BLOB_PATH` — file path containing the encrypted blob pointer (CLI `init`).
- `ECHOVAULT_EXPIRES_AT` — unix timestamp for grants (CLI `grant`).
- `ECHOVAULT_VAULT_LIMIT` — page size for `vaults`.
- `ECHOVAULT_VAULT_OFFSET` — pagination offset for `vaults`.
- `ECHOVAULT_GRANT_STATUS` — status filter for `grants` (e.g. active).
- `ECHOVAULT_GRANT_LIMIT` — page size for `grants`.
- `ECHOVAULT_GRANT_OFFSET` — pagination offset for `grants`.
- `ECHOVAULT_GRANT_EXPIRES_BEFORE` — expires-before unix timestamp filter.
- `ECHOVAULT_GRANT_EXPIRES_AFTER` — expires-after unix timestamp filter.
- `ECHOVAULT_GRANT_EXPIRES_WITHIN` — seconds-from-now expiry window filter.
- `ECHOVAULT_AUDIT_ACTION` — audit action filter.
- `ECHOVAULT_AUDIT_LIMIT` — page size for `audit`.
- `ECHOVAULT_AUDIT_OFFSET` — pagination offset for `audit`.
- `ECHOVAULT_AUDIT_SINCE` — unix timestamp lower bound for `audit`/`audit-summary`.
- `ECHOVAULT_AUDIT_UNTIL` — unix timestamp upper bound for `audit`/`audit-summary`.
- `ECHOVAULT_PAYMENT_TX` — payment transaction signature for `request`.
- `ECHOVAULT_PAYMENT_MINT` — payment mint for `request` (default `USDC`).
- `ECHOVAULT_PAYMENT_AMOUNT` — payment amount for `request` (default `0.001`).
- `ECHOVAULT_PAYMENT_PAYER` — expected payer authority for `request`.
- `ECHOVAULT_PAYMENT_RECIPIENT` — expected recipient token account for `request`.
- `ECHOVAULT_RESET_OK` — set to `yes` to confirm `reset`.

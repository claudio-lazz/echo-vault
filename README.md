# EchoVault

Composable Personal Context Layer for AI on Solana.

## Vision
Users own their context. Agents request permissioned, revocable access. Access can be monetized via x402.

## MVP
- **On-chain**: Context Vault + Access Grant + Revocation
- **Off-chain**: Encryption + storage gateway, Context API, Agent SDK
- **Payments**: x402 pay-per-read

## Demo (stub)
```
# 1) Init vault (stub)
echovault init

# 2) Grant access (stub)
echovault grant

# 3) Request context (stub)
echovault request
```

## Repo layout
- `programs/` Solana programs (Anchor)
- `packages/` SDK + API + CLI
- `docs/` specs and architecture

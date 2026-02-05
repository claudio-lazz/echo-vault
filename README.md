# EchoVault

Composable Personal Context Layer for AI on Solana.

## Vision
Users own their context. Agents request permissioned, revocable access. Access can be monetized via x402.

## MVP
- **On-chain**: Context Vault + Access Grant + Revocation
- **Off-chain**: Encryption + storage gateway, Context API, Agent SDK
- **Payments**: x402 pay-per-read

## Demo (draft)
See `docs/demo.md` for the end-to-end walkthrough. x402 verification now checks mint, amount, and optional payer/recipient.

## Repo layout
- `programs/` Solana programs (Anchor)
- `packages/` SDK + API + CLI
- `docs/` specs and architecture

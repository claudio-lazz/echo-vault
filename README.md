# EchoVault 🧬
> **Composable, permissioned context for AI agents — on Solana.**

[![Solana](https://img.shields.io/badge/Solana-000?logo=solana&logoColor=00D4AA)](https://solana.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![CLI](https://img.shields.io/badge/CLI-echovault-5E5CE6)](#cli)
[![License](https://img.shields.io/badge/License-MIT-0A0A0A)](LICENSE)

**EchoVault** makes AI context **portable, user‑owned, and revocable**. Users hold encrypted context as on‑chain assets and grant scoped access to agents with **expiry**, **revocation**, and optional **x402 pay‑per‑read**.

---

## ✨ Why EchoVault

| Problem today | EchoVault fix |
|---|---|
| Context is siloed per app | **Portable** across agents and workflows |
| Permissions are sticky | **Time‑boxed grants** + **revocation** |
| Users can’t monetize context | **x402 pay‑per‑read** |
| No audit trail | **On‑chain grant + audit logs** |

> **Thesis:** Context should be a user‑owned asset — not a vendor‑locked file.

---

## 🧭 Architecture (at a glance)

```
User (owner)
  ├─ Encrypt context → Storage (FS / IPFS / Arweave / S3)
  ├─ Mint Context Asset (cNFT / Token-2022)
  └─ Grant access (PDA) / Revoke

Agent
  ├─ Request context → 402 challenge (optional)
  ├─ Pay via x402
  └─ Receive encrypted blob pointer + metadata
```

---

## ✅ What’s in the MVP

**On‑chain primitives**
- Context vault asset (cNFT / Token‑2022)
- Access Grant PDA
- Revocation registry

**Off‑chain services**
- Context API
- Encryption helpers + storage adapters
- Agent SDK + CLI

**Payments**
- x402 pay‑per‑read (mint/amount validation + payer/recipient checks)

---

## 🚀 Quick Start

```bash
npm install
npx tsx scripts/e2e-demo.ts
```

See `docs/demo.md` for the full walkthrough.

### Encrypted demo (AES‑GCM)
```bash
export ECHOVAULT_SECRET=dev-secret
npx tsx scripts/encrypt-blob.ts '{"hello":"world"}' > /tmp/echovault-encrypted.json
export ECHOVAULT_ENCRYPTED_BLOB=$(cat /tmp/echovault-encrypted.json)
npx tsx scripts/e2e-encrypt-demo.ts
```

---

## 🧰 CLI

```bash
export ECHOVAULT_API=http://localhost:8787
export ECHOVAULT_OWNER=OWNER
export ECHOVAULT_GRANTEE=GRANTEE
export ECHOVAULT_SCOPE_HASH=SCOPE_HASH

# init vault + encrypted blob
npx echovault init

# fetch vault + list vaults/grants
npx echovault vault
npx echovault vaults
npx echovault grants

# grant + preview + request
npx echovault grant
npx echovault preview
npx echovault request
```

**Pagination / filters**
```bash
export ECHOVAULT_VAULT_LIMIT=25
export ECHOVAULT_VAULT_OFFSET=0
npx echovault vaults

export ECHOVAULT_GRANT_STATUS=active
export ECHOVAULT_GRANT_LIMIT=25
export ECHOVAULT_GRANT_OFFSET=0
npx echovault grants
npx echovault grants-summary

export ECHOVAULT_AUDIT_ACTION=grant
export ECHOVAULT_AUDIT_LIMIT=25
export ECHOVAULT_AUDIT_OFFSET=0
export ECHOVAULT_AUDIT_SINCE=$(date +%s%3N)
export ECHOVAULT_AUDIT_UNTIL=$(date +%s%3N)
npx echovault audit
npx echovault audit-summary
```

Dangerous reset (dev store only):
```bash
ECHOVAULT_RESET_OK=yes npx echovault reset
```

---

## 📚 Docs

| Doc | What it covers |
|---|---|
| `docs/api.md` | API requests, responses, error codes |
| `docs/demo.md` | End‑to‑end demo walkthrough |
| `docs/demo-video-plan.md` | Recording checklist |
| `docs/forum.md` | Forum helper |

---

## 📦 Repo Layout

```
programs/     # Solana programs (Anchor)
packages/     # SDK + API + CLI
docs/         # Specs, architecture, flows
scripts/      # Demo + helper scripts
apps/         # App scaffolds
```

---

## 🗺️ Roadmap (Short‑Term)

- Persistent storage adapters (IPFS / Arweave / S3)
- On‑chain grant + revoke enforcement
- Policy DSL + richer audit analytics
- SDK ergonomics + agent integrations

---

**EchoVault is the foundation for user‑owned, permissioned AI context — portable across agents and apps, without sacrificing control or privacy.**

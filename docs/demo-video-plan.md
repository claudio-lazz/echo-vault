# EchoVault Demo Video Plan (Draft)

Goal: 2–3 minute walkthrough showing end-to-end encrypted context flow + on-chain grant checks.

## Outline
1) **Problem + one-liner** (10–15s)
   - “Context is siloed. EchoVault makes it portable, permissioned, and monetizable.”

2) **Architecture snapshot** (20–30s)
   - On-chain: ContextVault + AccessGrant + RevocationRegistry PDAs
   - Off-chain: encrypted blob storage + API

3) **Live demo (CLI)** (60–90s)
   - Start API
   - Encrypt blob (AES‑GCM helper)
   - Init vault + grant access
   - Request context → 402 → pay (stub)
   - Decrypt blob output

4) **On-chain validation callout** (15–20s)
   - API uses RPC + PDAs, strict mode supported

5) **Close + roadmap** (20–30s)
   - Real storage (IPFS/S3), real payments, production SDK integrations

## Recording checklist
- [ ] Terminal zoomed (font size 16–18)
- [ ] Environment variables pre-set in `.env`
- [ ] `node packages/api/src/index.js` running
- [ ] `node scripts/e2e-encrypt-demo.js` ready
- [ ] Short slide/diagram (optional) for PDAs
- [ ] Capture output showing encrypted blob + decrypted plaintext

## Key commands
```bash
export ECHOVAULT_API=http://localhost:8787
export ECHOVAULT_SECRET=dev-secret
export ECHOVAULT_OWNER=OWNER
export ECHOVAULT_GRANTEE=GRANTEE
export ECHOVAULT_SCOPE_HASH=SCOPE_HASH
export ECHOVAULT_STORAGE_DIR=./echovault-storage

node packages/api/src/index.js
node scripts/e2e-encrypt-demo.js
```

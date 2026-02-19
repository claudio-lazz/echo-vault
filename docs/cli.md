# CLI

The EchoVault CLI is a lightweight dev stub for interacting with the local API using environment variables. Most commands rely on env vars for input (see `docs/env.md`).

## Install / run

```bash
# from the repo
npm install

# run the CLI via npx
npx echovault --help
```

## Common setup

```bash
export ECHOVAULT_API=http://localhost:8787
export ECHOVAULT_OWNER=OWNER
export ECHOVAULT_GRANTEE=GRANTEE
export ECHOVAULT_SCOPE_HASH=SCOPE_HASH
```

## Typical flows

```bash
# init a vault + encrypted blob pointer
npx echovault init

# list vaults / grants
npx echovault vaults
npx echovault grants

# grant + preview + request
npx echovault grant
npx echovault preview
npx echovault request
```

## File-backed env values

```bash
# load payloads from files instead of env strings
export ECHOVAULT_CONTEXT_URI_PATH=./context-uri.txt
export ECHOVAULT_ENCRYPTED_BLOB_PATH=./encrypted-blob.txt
npx echovault init
```

## Pagination / filters

```bash
export ECHOVAULT_VAULT_LIMIT=25
export ECHOVAULT_VAULT_OFFSET=0
npx echovault vaults

export ECHOVAULT_GRANT_STATUS=active
export ECHOVAULT_GRANT_LIMIT=25
export ECHOVAULT_GRANT_OFFSET=0
export ECHOVAULT_GRANT_EXPIRES_BEFORE=$(date +%s)
export ECHOVAULT_GRANT_EXPIRES_AFTER=$(date +%s)
export ECHOVAULT_GRANT_EXPIRES_WITHIN=3600
npx echovault grants
npx echovault grants-summary
```

## Debugging

```bash
# emit debug warnings for missing/empty env-path files
export ECHOVAULT_CLI_DEBUG=1
npx echovault vault
```

See `docs/env.md` for the full environment variable reference.

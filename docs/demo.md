# EchoVault Demo (Draft)

## Local API
```
cd packages/api
npm install
node src/index.js
```

## CLI
```
# Set API URL
export ECHOVAULT_API=http://localhost:8787

# Init vault (stub)
echovault init

# Grant access (stub)
echovault grant

# Request context (returns 402 challenge)
echovault request

# Provide payment tx signature (stub)
export ECHOVAULT_PAYMENT_TX=TX_SIG
echovault request
```

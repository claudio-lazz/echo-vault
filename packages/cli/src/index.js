#!/usr/bin/env node

const cmd = process.argv[2];

if (!cmd) {
  console.log('echovault <init|grant|request>');
  process.exit(0);
}

if (cmd === 'init') {
  console.log('init vault (stub)');
  console.log('POST /vault/init { owner, context_uri }');
} else if (cmd === 'grant') {
  console.log('grant access (stub)');
  console.log('POST /vault/grant { owner, grantee, scope_hash, expires_at }');
} else if (cmd === 'request') {
  console.log('request context (stub)');
  console.log('POST /context/request { payment? }');
} else {
  console.log('unknown command');
}

#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { postJson, getJson } from './http';

type ApiError = { code?: string };

function readEnvPath(key: string): string | undefined {
  const path = process.env[key];
  if (!path) return undefined;
  return readFileSync(path, 'utf8').trim();
}

const cmd = process.argv[2];
const api = process.env.ECHOVAULT_API || 'http://localhost:8787';

if (!cmd) {
  console.log('echovault <status|init|vault|vaults|grant|revoke|grants|grants-summary|audit|audit-summary|preview|request|reset>');
  process.exit(0);
}

(async () => {
  if (cmd === 'status') {
    const { status, json } = await getJson<ApiError>(`${api}/status`);
    if (json?.code) console.error('error', json.code);
    console.log(status, json);
  } else if (cmd === 'init') {
    const owner = process.env.ECHOVAULT_OWNER || 'OWNER';
    const context_uri =
      process.env.ECHOVAULT_CONTEXT_URI ||
      readEnvPath('ECHOVAULT_CONTEXT_URI_PATH') ||
      'ipfs://encrypted-context-placeholder';
    const encrypted_blob =
      process.env.ECHOVAULT_ENCRYPTED_BLOB ||
      readEnvPath('ECHOVAULT_ENCRYPTED_BLOB_PATH') ||
      'ENCRYPTED_BLOB_PLACEHOLDER';
    const { status, json } = await postJson<ApiError>(`${api}/vault/init`, { owner, context_uri, encrypted_blob });
    if (json?.code) console.error('error', json.code);
    console.log(status, json);
  } else if (cmd === 'vault') {
    const owner = process.env.ECHOVAULT_OWNER || 'OWNER';
    const { status, json } = await getJson<ApiError>(`${api}/vault/${owner}`);
    if (json?.code) console.error('error', json.code);
    console.log(status, json);
  } else if (cmd === 'vaults') {
    const owner = process.env.ECHOVAULT_OWNER;
    const limit = process.env.ECHOVAULT_VAULT_LIMIT;
    const offset = process.env.ECHOVAULT_VAULT_OFFSET;
    const qs = new URLSearchParams();
    if (owner) qs.set('owner', owner);
    if (limit) qs.set('limit', limit);
    if (offset) qs.set('offset', offset);
    const url = qs.toString() ? `${api}/vaults?${qs.toString()}` : `${api}/vaults`;
    const { status, json } = await getJson<ApiError>(url);
    if (json?.code) console.error('error', json.code);
    console.log(status, json);
  } else if (cmd === 'grant') {
    const owner = process.env.ECHOVAULT_OWNER || 'OWNER';
    const grantee = process.env.ECHOVAULT_GRANTEE || 'GRANTEE';
    const scope_hash = process.env.ECHOVAULT_SCOPE_HASH || 'SCOPE_HASH';
    const expires_at = Number(process.env.ECHOVAULT_EXPIRES_AT || Date.now() / 1000);
    const { status, json } = await postJson<ApiError>(`${api}/vault/grant`, { owner, grantee, scope_hash, expires_at });
    if (json?.code) console.error('error', json.code);
    console.log(status, json);
  } else if (cmd === 'grants') {
    const owner = process.env.ECHOVAULT_OWNER;
    const grantee = process.env.ECHOVAULT_GRANTEE;
    const statusFilter = process.env.ECHOVAULT_GRANT_STATUS;
    const limit = process.env.ECHOVAULT_GRANT_LIMIT;
    const offset = process.env.ECHOVAULT_GRANT_OFFSET;
    const expiresBefore = process.env.ECHOVAULT_GRANT_EXPIRES_BEFORE;
    const expiresAfter = process.env.ECHOVAULT_GRANT_EXPIRES_AFTER;
    const qs = new URLSearchParams();
    if (owner) qs.set('owner', owner);
    if (grantee) qs.set('grantee', grantee);
    if (statusFilter) qs.set('status', statusFilter);
    if (limit) qs.set('limit', limit);
    if (offset) qs.set('offset', offset);
    if (expiresBefore) qs.set('expires_before', expiresBefore);
    if (expiresAfter) qs.set('expires_after', expiresAfter);
    const url = qs.toString() ? `${api}/vault/grants?${qs.toString()}` : `${api}/vault/grants`;
    const { status, json } = await getJson<ApiError>(url);
    if (json?.code) console.error('error', json.code);
    console.log(status, json);
  } else if (cmd === 'grants-summary') {
    const owner = process.env.ECHOVAULT_OWNER;
    const grantee = process.env.ECHOVAULT_GRANTEE;
    const expiresBefore = process.env.ECHOVAULT_GRANT_EXPIRES_BEFORE;
    const expiresAfter = process.env.ECHOVAULT_GRANT_EXPIRES_AFTER;
    const qs = new URLSearchParams();
    if (owner) qs.set('owner', owner);
    if (grantee) qs.set('grantee', grantee);
    if (expiresBefore) qs.set('expires_before', expiresBefore);
    if (expiresAfter) qs.set('expires_after', expiresAfter);
    const url = qs.toString() ? `${api}/vault/grants/summary?${qs.toString()}` : `${api}/vault/grants/summary`;
    const { status, json } = await getJson<ApiError>(url);
    if (json?.code) console.error('error', json.code);
    console.log(status, json);
  } else if (cmd === 'audit') {
    const owner = process.env.ECHOVAULT_OWNER;
    const grantee = process.env.ECHOVAULT_GRANTEE;
    const action = process.env.ECHOVAULT_AUDIT_ACTION;
    const limit = process.env.ECHOVAULT_AUDIT_LIMIT;
    const offset = process.env.ECHOVAULT_AUDIT_OFFSET;
    const since = process.env.ECHOVAULT_AUDIT_SINCE;
    const until = process.env.ECHOVAULT_AUDIT_UNTIL;
    const qs = new URLSearchParams();
    if (owner) qs.set('owner', owner);
    if (grantee) qs.set('grantee', grantee);
    if (action) qs.set('action', action);
    if (limit) qs.set('limit', limit);
    if (offset) qs.set('offset', offset);
    if (since) qs.set('since', since);
    if (until) qs.set('until', until);
    const url = qs.toString() ? `${api}/audit?${qs.toString()}` : `${api}/audit`;
    const { status, json } = await getJson<ApiError>(url);
    if (json?.code) console.error('error', json.code);
    console.log(status, json);
  } else if (cmd === 'audit-summary') {
    const owner = process.env.ECHOVAULT_OWNER;
    const grantee = process.env.ECHOVAULT_GRANTEE;
    const action = process.env.ECHOVAULT_AUDIT_ACTION;
    const since = process.env.ECHOVAULT_AUDIT_SINCE;
    const until = process.env.ECHOVAULT_AUDIT_UNTIL;
    const qs = new URLSearchParams();
    if (owner) qs.set('owner', owner);
    if (grantee) qs.set('grantee', grantee);
    if (action) qs.set('action', action);
    if (since) qs.set('since', since);
    if (until) qs.set('until', until);
    const url = qs.toString() ? `${api}/audit/summary?${qs.toString()}` : `${api}/audit/summary`;
    const { status, json } = await getJson<ApiError>(url);
    if (json?.code) console.error('error', json.code);
    console.log(status, json);
  } else if (cmd === 'revoke') {
    const owner = process.env.ECHOVAULT_OWNER || 'OWNER';
    const grantee = process.env.ECHOVAULT_GRANTEE || 'GRANTEE';
    const scope_hash = process.env.ECHOVAULT_SCOPE_HASH || 'SCOPE_HASH';
    const { status, json } = await postJson<ApiError>(`${api}/vault/revoke`, { owner, grantee, scope_hash });
    if (json?.code) console.error('error', json.code);
    console.log(status, json);
  } else if (cmd === 'preview') {
    const owner = process.env.ECHOVAULT_OWNER || 'OWNER';
    const grantee = process.env.ECHOVAULT_GRANTEE || 'GRANTEE';
    const scope_hash = process.env.ECHOVAULT_SCOPE_HASH || 'SCOPE_HASH';
    const { status, json } = await postJson<ApiError>(`${api}/context/preview`, { owner, grantee, scope_hash });
    if (json?.code) console.error('error', json.code);
    console.log(status, json);
  } else if (cmd === 'request') {
    const txSig = process.env.ECHOVAULT_PAYMENT_TX;
    const mint = process.env.ECHOVAULT_PAYMENT_MINT || 'USDC';
    const amount = process.env.ECHOVAULT_PAYMENT_AMOUNT || '0.001';
    const payer = process.env.ECHOVAULT_PAYMENT_PAYER;
    const recipient = process.env.ECHOVAULT_PAYMENT_RECIPIENT;
    const owner = process.env.ECHOVAULT_OWNER || 'OWNER';
    const grantee = process.env.ECHOVAULT_GRANTEE || 'GRANTEE';
    const scope_hash = process.env.ECHOVAULT_SCOPE_HASH || 'SCOPE_HASH';
    const payment: Record<string, string> | null = txSig ? { txSig, mint, amount } : null;
    if (payment && payer) payment.payer = payer;
    if (payment && recipient) payment.recipient = recipient;
    const body = payment ? { owner, grantee, scope_hash, payment } : { owner, grantee, scope_hash };
    const { status, json } = await postJson<ApiError>(`${api}/context/request`, body);
    if (json?.code) console.error('error', json.code);
    console.log(status, json);
  } else if (cmd === 'reset') {
    const confirm = process.env.ECHOVAULT_RESET_OK;
    if (confirm !== 'yes') {
      console.error('reset blocked: set ECHOVAULT_RESET_OK=yes to proceed');
      process.exit(1);
    }
    const { status, json } = await postJson<ApiError>(`${api}/dev/reset`, {});
    if (json?.code) console.error('error', json.code);
    console.log(status, json);
  } else {
    console.log('unknown command');
  }
})();

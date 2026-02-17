const defaultApi = process.env.ECHOVAULT_API || 'http://localhost:8787';

export type ApiResult<T = unknown> = {
  ok: boolean;
  status: number;
  json: T;
};

export type GrantStatus = 'active' | 'revoked' | 'expired';
export type GrantStatusFilter = GrantStatus | 'all';

export type Grant = {
  owner: string;
  grantee: string;
  scope_hash: string;
  expires_at: number | null;
  revoked?: boolean;
  status?: GrantStatus;
};

export type GrantSummary = {
  total: number;
  counts: {
    active: number;
    revoked: number;
    expired: number;
  };
};

export type VaultSummary = {
  owner: string;
  context_uri: string;
  storage: 'filesystem' | 'memory';
  grants: GrantSummary;
};

export type AuditAction = 'vault_init' | 'grant' | 'revoke' | 'context_request';

export type AuditEvent = {
  id: string;
  ts: number;
  action: AuditAction;
  owner?: string;
  grantee?: string;
  scope_hash?: string;
  meta?: Record<string, unknown>;
};

export type AuditSummary = {
  total: number;
  counts: Partial<Record<AuditAction, number>>;
  latest: AuditEvent | null;
};

export type InitVaultArgs = {
  owner: string;
  context_uri: string;
  encrypted_blob: unknown;
  api?: string;
};

export type GrantAccessArgs = {
  owner: string;
  grantee: string;
  scope_hash: string;
  expires_at?: string | number;
  api?: string;
};

export type RevokeAccessArgs = {
  owner: string;
  grantee: string;
  scope_hash: string;
  api?: string;
};

export type PreviewContextArgs = {
  owner: string;
  grantee: string;
  scope_hash: string;
  api?: string;
};

export type RequestContextArgs = {
  owner: string;
  grantee: string;
  scope_hash: string;
  payment?: unknown;
  api?: string;
};

export type FetchContextArgs = RequestContextArgs;

export type ListGrantsArgs = {
  owner?: string;
  grantee?: string;
  status?: GrantStatusFilter;
  limit?: number;
  offset?: number;
  expires_before?: number;
  expires_after?: number;
  expires_within?: number;
  api?: string;
};

export type GrantSummaryArgs = {
  owner?: string;
  grantee?: string;
  expires_before?: number;
  expires_after?: number;
  expires_within?: number;
  api?: string;
};

export type ListVaultsArgs = {
  owner?: string;
  limit?: number;
  offset?: number;
  api?: string;
};

export type ListAuditArgs = {
  owner?: string;
  grantee?: string;
  action?: AuditAction;
  limit?: number;
  offset?: number;
  since?: number;
  until?: number;
  api?: string;
};

export type AuditSummaryArgs = {
  owner?: string;
  grantee?: string;
  action?: AuditAction;
  since?: number;
  until?: number;
  api?: string;
};

export type Decryptor<T = unknown, R = unknown> = (blob: T) => R;

function buildQuery(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === '') return;
    search.set(key, value);
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

async function postJson<T = unknown>(url: string, body?: unknown): Promise<ApiResult<T>> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {})
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json: json as T };
}

async function getJson<T = unknown>(url: string): Promise<ApiResult<T>> {
  const res = await fetch(url);
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json: json as T };
}

export async function initVault({ owner, context_uri, encrypted_blob, api = defaultApi }: InitVaultArgs) {
  return postJson(`${api}/vault/init`, { owner, context_uri, encrypted_blob });
}

export async function grantAccess({ owner, grantee, scope_hash, expires_at, api = defaultApi }: GrantAccessArgs) {
  return postJson(`${api}/vault/grant`, { owner, grantee, scope_hash, expires_at });
}

export async function revokeAccess({ owner, grantee, scope_hash, api = defaultApi }: RevokeAccessArgs) {
  return postJson(`${api}/vault/revoke`, { owner, grantee, scope_hash });
}

export async function listGrants({ owner, grantee, status, limit, offset, expires_before, expires_after, expires_within, api = defaultApi }: ListGrantsArgs) {
  const query = buildQuery({
    owner,
    grantee,
    status,
    limit: limit !== undefined ? String(limit) : undefined,
    offset: offset !== undefined ? String(offset) : undefined,
    expires_before: expires_before !== undefined ? String(expires_before) : undefined,
    expires_after: expires_after !== undefined ? String(expires_after) : undefined,
    expires_within: expires_within !== undefined ? String(expires_within) : undefined
  });
  return getJson<{ ok: boolean; total: number; offset: number; limit: number | null; grants: Grant[] }>(`${api}/vault/grants${query}`);
}

export async function grantSummary({ owner, grantee, expires_before, expires_after, expires_within, api = defaultApi }: GrantSummaryArgs) {
  const query = buildQuery({
    owner,
    grantee,
    expires_before: expires_before !== undefined ? String(expires_before) : undefined,
    expires_after: expires_after !== undefined ? String(expires_after) : undefined,
    expires_within: expires_within !== undefined ? String(expires_within) : undefined
  });
  return getJson<{ ok: boolean; total: number; counts: GrantSummary['counts'] }>(`${api}/vault/grants/summary${query}`);
}

export async function listVaults({ owner, limit, offset, api = defaultApi }: ListVaultsArgs) {
  const query = buildQuery({
    owner,
    limit: limit !== undefined ? String(limit) : undefined,
    offset: offset !== undefined ? String(offset) : undefined
  });
  return getJson<{ ok: boolean; total: number; offset: number; limit: number | null; vaults: VaultSummary[] }>(`${api}/vaults${query}`);
}

export async function listAudit({ owner, grantee, action, limit, offset, since, until, api = defaultApi }: ListAuditArgs) {
  const query = buildQuery({
    owner,
    grantee,
    action,
    limit: limit !== undefined ? String(limit) : undefined,
    offset: offset !== undefined ? String(offset) : undefined,
    since: since !== undefined ? String(since) : undefined,
    until: until !== undefined ? String(until) : undefined
  });
  return getJson<{ ok: boolean; total: number; offset: number; limit: number; events: AuditEvent[] }>(`${api}/audit${query}`);
}

export async function auditSummary({ owner, grantee, action, since, until, api = defaultApi }: AuditSummaryArgs) {
  const query = buildQuery({
    owner,
    grantee,
    action,
    since: since !== undefined ? String(since) : undefined,
    until: until !== undefined ? String(until) : undefined
  });
  return getJson<{ ok: boolean; total: number; counts: AuditSummary['counts']; latest: AuditSummary['latest'] }>(`${api}/audit/summary${query}`);
}

export async function previewContext({ owner, grantee, scope_hash, api = defaultApi }: PreviewContextArgs) {
  return postJson(`${api}/context/preview`, { owner, grantee, scope_hash });
}

export async function requestContext({ owner, grantee, scope_hash, payment, api = defaultApi }: RequestContextArgs) {
  return postJson(`${api}/context/request`, { owner, grantee, scope_hash, payment });
}

export async function fetchContext({ owner, grantee, scope_hash, payment, api = defaultApi }: FetchContextArgs) {
  const result = await requestContext({ owner, grantee, scope_hash, payment, api });
  return unwrapOrThrow(result);
}

export function decryptBlob<T = unknown, R = unknown>({ encrypted_blob, decryptor }: { encrypted_blob: T; decryptor?: Decryptor<T, R> }): T | R {
  if (typeof decryptor === 'function') return decryptor(encrypted_blob);
  return encrypted_blob;
}

export { encryptBlob, decryptBlob as decryptBlobPayload } from './crypto';

export function unwrapOrThrow<T = unknown>(result: ApiResult<T>): T {
  if (!result?.ok) {
    const payload = result?.json as Record<string, unknown> | undefined;
    const code = (payload?.code || payload?.reason || 'request_failed') as string;
    const err = new Error(code) as Error & { code?: string; status?: number; payload?: unknown };
    err.code = code;
    err.status = result?.status;
    err.payload = result?.json;
    throw err;
  }
  return result.json;
}

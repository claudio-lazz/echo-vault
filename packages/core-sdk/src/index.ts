const defaultApi = process.env.ECHOVAULT_API || 'http://localhost:8787';

export type ApiResult<T = unknown> = {
  ok: boolean;
  status: number;
  json: T;
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

export type Decryptor<T = unknown, R = unknown> = (blob: T) => R;

async function postJson<T = unknown>(url: string, body?: unknown): Promise<ApiResult<T>> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {})
  });
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

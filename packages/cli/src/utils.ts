import { readFileSync } from 'node:fs';

type ApiError = { code?: string } & Record<string, unknown>;

type JsonResult<T = unknown> = { status: number; json: T };

function readEnvPath(key: string): string | undefined {
  const path = process.env[key];
  if (!path) return undefined;
  return readFileSync(path, 'utf8').trim();
}

function getApi(): string {
  return process.env.ECHOVAULT_API || 'http://localhost:8787';
}

function logResult<T = ApiError>(result: JsonResult<T>) {
  const json = result.json as ApiError;
  if (json?.code) console.error('error', json.code);
  console.log(result.status, result.json);
}

export { readEnvPath, getApi, logResult };
export type { ApiError, JsonResult };

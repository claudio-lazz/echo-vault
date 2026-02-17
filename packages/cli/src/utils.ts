import { readFileSync } from 'node:fs';

type ApiError = { code?: string; reason?: string; message?: string } & Record<string, unknown>;

type JsonResult<T = unknown> = { status: number; json: T };

function readEnvPath(key: string): string | undefined {
  const path = process.env[key];
  if (!path) return undefined;
  try {
    return readFileSync(path, 'utf8').trim();
  } catch (error) {
    return undefined;
  }
}

function getApi(): string {
  return process.env.ECHOVAULT_API || 'http://localhost:8787';
}

function logResult<T = ApiError>(result: JsonResult<T>) {
  const json = result.json as ApiError;
  if (json?.code || json?.reason || json?.message) {
    const detail = json?.message || json?.reason || json?.code;
    const code = json?.code || json?.reason || json?.message;
    if (detail && code && detail !== code) {
      console.error('error', code, '-', detail);
    } else if (detail) {
      console.error('error', detail);
    }
  }
  console.log(result.status, result.json);
}

export { readEnvPath, getApi, logResult };
export type { ApiError, JsonResult };

import { readFileSync } from 'node:fs';

type ApiError = { code?: string; reason?: string; message?: string } & Record<string, unknown>;

type JsonResult<T = unknown> = { status: number; json: T };

function readEnvPath(key: string): string | undefined {
  const path = process.env[key];
  if (!path) return undefined;
  const debug = process.env.ECHOVAULT_CLI_DEBUG === '1';
  try {
    const value = readFileSync(path, 'utf8').trim();
    if (value.length > 0) return value;
    if (debug) console.warn('warn', `${key} file is empty at ${path}`);
    return undefined;
  } catch (error) {
    if (debug) console.warn('warn', `${key} file not found at ${path}`);
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

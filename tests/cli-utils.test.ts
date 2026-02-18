import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { logResult, readEnvPath } from '../packages/cli/src/utils';

describe('cli utils logResult', () => {
  const consoleError = vi.spyOn(console, 'error');
  const consoleLog = vi.spyOn(console, 'log');

  beforeEach(() => {
    consoleError.mockReset();
    consoleLog.mockReset();
  });

  afterEach(() => {
    consoleError.mockReset();
    consoleLog.mockReset();
  });

  it('logs error code and message when both exist', () => {
    logResult({ status: 400, json: { code: 'bad_request', message: 'missing_owner' } });
    expect(consoleError).toHaveBeenCalledWith('error', 'bad_request', '-', 'missing_owner');
    expect(consoleLog).toHaveBeenCalledWith(400, { code: 'bad_request', message: 'missing_owner' });
  });

  it('logs error detail when only message exists', () => {
    logResult({ status: 403, json: { message: 'forbidden' } });
    expect(consoleError).toHaveBeenCalledWith('error', 'forbidden');
    expect(consoleLog).toHaveBeenCalledWith(403, { message: 'forbidden' });
  });
});

describe('cli utils readEnvPath', () => {
  const originalEnv = { ...process.env };
  const consoleWarn = vi.spyOn(console, 'warn');

  afterEach(() => {
    process.env = { ...originalEnv };
    consoleWarn.mockReset();
  });

  it('returns trimmed file contents when path exists', () => {
    const dir = mkdtempSync(join(tmpdir(), 'echovault-cli-'));
    const filePath = join(dir, 'value.txt');
    writeFileSync(filePath, ' value\n');
    process.env.ECHOVAULT_CONTEXT_URI_PATH = filePath;
    expect(readEnvPath('ECHOVAULT_CONTEXT_URI_PATH')).toBe('value');
    rmSync(dir, { recursive: true, force: true });
  });

  it('returns undefined when path is missing', () => {
    process.env.ECHOVAULT_CONTEXT_URI_PATH = '/tmp/does-not-exist.txt';
    expect(readEnvPath('ECHOVAULT_CONTEXT_URI_PATH')).toBeUndefined();
  });

  it('warns in debug when path is missing', () => {
    process.env.ECHOVAULT_CLI_DEBUG = '1';
    process.env.ECHOVAULT_CONTEXT_URI_PATH = '/tmp/does-not-exist.txt';
    expect(readEnvPath('ECHOVAULT_CONTEXT_URI_PATH')).toBeUndefined();
    expect(console.warn).toHaveBeenCalledWith(
      'warn',
      'ECHOVAULT_CONTEXT_URI_PATH file not found at /tmp/does-not-exist.txt'
    );
  });

  it('returns undefined when file is empty after trim', () => {
    const dir = mkdtempSync(join(tmpdir(), 'echovault-cli-'));
    const filePath = join(dir, 'value.txt');
    writeFileSync(filePath, '   \n\n');
    process.env.ECHOVAULT_CONTEXT_URI_PATH = filePath;
    expect(readEnvPath('ECHOVAULT_CONTEXT_URI_PATH')).toBeUndefined();
    rmSync(dir, { recursive: true, force: true });
  });

  it('warns in debug when file is empty after trim', () => {
    const dir = mkdtempSync(join(tmpdir(), 'echovault-cli-'));
    const filePath = join(dir, 'value.txt');
    writeFileSync(filePath, '   \n\n');
    process.env.ECHOVAULT_CLI_DEBUG = '1';
    process.env.ECHOVAULT_CONTEXT_URI_PATH = filePath;
    expect(readEnvPath('ECHOVAULT_CONTEXT_URI_PATH')).toBeUndefined();
    expect(console.warn).toHaveBeenCalledWith(
      'warn',
      `ECHOVAULT_CONTEXT_URI_PATH file is empty at ${filePath}`
    );
    rmSync(dir, { recursive: true, force: true });
  });
});

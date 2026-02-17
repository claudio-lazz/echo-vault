import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logResult } from '../packages/cli/src/utils';

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

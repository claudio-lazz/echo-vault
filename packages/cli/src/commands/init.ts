import { Command } from 'commander';
import { postJson } from '../http';
import { getApi, readEnvPath, logResult, ApiError } from '../utils';

function registerInit(program: Command) {
  program
    .command('init')
    .description('Initialize a vault (dev stub)')
    .action(async () => {
      const api = getApi();
      const owner = process.env.ECHOVAULT_OWNER || 'OWNER';
      const context_uri =
        process.env.ECHOVAULT_CONTEXT_URI ||
        readEnvPath('ECHOVAULT_CONTEXT_URI_PATH') ||
        'ipfs://encrypted-context-placeholder';
      const encrypted_blob =
        process.env.ECHOVAULT_ENCRYPTED_BLOB ||
        readEnvPath('ECHOVAULT_ENCRYPTED_BLOB_PATH') ||
        'ENCRYPTED_BLOB_PLACEHOLDER';
      const result = await postJson<ApiError>(`${api}/vault/init`, { owner, context_uri, encrypted_blob });
      logResult(result);
    });
}

export { registerInit };

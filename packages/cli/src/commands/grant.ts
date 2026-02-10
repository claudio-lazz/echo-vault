import { Command } from 'commander';
import { postJson } from '../http';
import { getApi, logResult, ApiError } from '../utils';

function registerGrant(program: Command) {
  program
    .command('grant')
    .description('Grant access (dev stub)')
    .action(async () => {
      const api = getApi();
      const owner = process.env.ECHOVAULT_OWNER || 'OWNER';
      const grantee = process.env.ECHOVAULT_GRANTEE || 'GRANTEE';
      const scope_hash = process.env.ECHOVAULT_SCOPE_HASH || 'SCOPE_HASH';
      const expires_at = Number(process.env.ECHOVAULT_EXPIRES_AT || Date.now() / 1000);
      const result = await postJson<ApiError>(`${api}/vault/grant`, { owner, grantee, scope_hash, expires_at });
      logResult(result);
    });
}

export { registerGrant };

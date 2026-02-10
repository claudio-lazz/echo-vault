import { Command } from 'commander';
import { postJson } from '../http';
import { getApi, logResult, ApiError } from '../utils';

function registerRevoke(program: Command) {
  program
    .command('revoke')
    .description('Revoke access (dev stub)')
    .action(async () => {
      const api = getApi();
      const owner = process.env.ECHOVAULT_OWNER || 'OWNER';
      const grantee = process.env.ECHOVAULT_GRANTEE || 'GRANTEE';
      const scope_hash = process.env.ECHOVAULT_SCOPE_HASH || 'SCOPE_HASH';
      const result = await postJson<ApiError>(`${api}/vault/revoke`, { owner, grantee, scope_hash });
      logResult(result);
    });
}

export { registerRevoke };

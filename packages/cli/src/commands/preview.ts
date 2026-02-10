import { Command } from 'commander';
import { postJson } from '../http';
import { getApi, logResult, ApiError } from '../utils';

function registerPreview(program: Command) {
  program
    .command('preview')
    .description('Preview context (dev stub)')
    .action(async () => {
      const api = getApi();
      const owner = process.env.ECHOVAULT_OWNER || 'OWNER';
      const grantee = process.env.ECHOVAULT_GRANTEE || 'GRANTEE';
      const scope_hash = process.env.ECHOVAULT_SCOPE_HASH || 'SCOPE_HASH';
      const result = await postJson<ApiError>(`${api}/context/preview`, { owner, grantee, scope_hash });
      logResult(result);
    });
}

export { registerPreview };

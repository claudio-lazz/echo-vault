import { Command } from 'commander';
import { getJson } from '../http';
import { getApi, logResult, ApiError } from '../utils';

function registerVaults(program: Command) {
  program
    .command('vaults')
    .description('List vaults (dev stub)')
    .action(async () => {
      const api = getApi();
      const owner = process.env.ECHOVAULT_OWNER;
      const limit = process.env.ECHOVAULT_VAULT_LIMIT;
      const offset = process.env.ECHOVAULT_VAULT_OFFSET;
      const qs = new URLSearchParams();
      if (owner) qs.set('owner', owner);
      if (limit) qs.set('limit', limit);
      if (offset) qs.set('offset', offset);
      const url = qs.toString() ? `${api}/vaults?${qs.toString()}` : `${api}/vaults`;
      const result = await getJson<ApiError>(url);
      logResult(result);
    });
}

export { registerVaults };

import { Command } from 'commander';
import { getJson } from '../http';
import { getApi, logResult, ApiError } from '../utils';

function registerVault(program: Command) {
  program
    .command('vault')
    .description('Fetch a vault by owner (dev stub)')
    .action(async () => {
      const api = getApi();
      const owner = process.env.ECHOVAULT_OWNER || 'OWNER';
      const result = await getJson<ApiError>(`${api}/vault/${owner}`);
      logResult(result);
    });
}

export { registerVault };

import { Command } from 'commander';
import { getJson } from '../http';
import { getApi, logResult, ApiError } from '../utils';

function registerStatus(program: Command) {
  program
    .command('status')
    .description('Show API status (dev)')
    .action(async () => {
      const api = getApi();
      const result = await getJson<ApiError>(`${api}/status`);
      logResult(result);
    });
}

export { registerStatus };

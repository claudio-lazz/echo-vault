import { Command } from 'commander';
import { postJson } from '../http';
import { getApi, logResult, ApiError } from '../utils';

function registerReset(program: Command) {
  program
    .command('reset')
    .description('Reset dev store (dangerous)')
    .action(async () => {
      const confirm = process.env.ECHOVAULT_RESET_OK;
      if (confirm !== 'yes') {
        console.error('reset blocked: set ECHOVAULT_RESET_OK=yes to proceed');
        process.exit(1);
      }
      const api = getApi();
      const result = await postJson<ApiError>(`${api}/dev/reset`, {});
      logResult(result);
    });
}

export { registerReset };

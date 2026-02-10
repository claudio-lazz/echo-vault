import { Command } from 'commander';
import { getJson } from '../http';
import { getApi, logResult, ApiError } from '../utils';

function registerGrantsSummary(program: Command) {
  program
    .command('grants-summary')
    .description('Summarize grants (dev stub)')
    .action(async () => {
      const api = getApi();
      const owner = process.env.ECHOVAULT_OWNER;
      const grantee = process.env.ECHOVAULT_GRANTEE;
      const expiresBefore = process.env.ECHOVAULT_GRANT_EXPIRES_BEFORE;
      const expiresAfter = process.env.ECHOVAULT_GRANT_EXPIRES_AFTER;
      const expiresWithin = process.env.ECHOVAULT_GRANT_EXPIRES_WITHIN;
      const qs = new URLSearchParams();
      if (owner) qs.set('owner', owner);
      if (grantee) qs.set('grantee', grantee);
      if (expiresBefore) qs.set('expires_before', expiresBefore);
      if (expiresAfter) qs.set('expires_after', expiresAfter);
      if (expiresWithin) qs.set('expires_within', expiresWithin);
      const url = qs.toString() ? `${api}/vault/grants/summary?${qs.toString()}` : `${api}/vault/grants/summary`;
      const result = await getJson<ApiError>(url);
      logResult(result);
    });
}

export { registerGrantsSummary };

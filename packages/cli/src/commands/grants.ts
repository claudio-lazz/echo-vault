import { Command } from 'commander';
import { getJson } from '../http';
import { getApi, logResult, ApiError } from '../utils';

function registerGrants(program: Command) {
  program
    .command('grants')
    .description('List grants (dev stub)')
    .action(async () => {
      const api = getApi();
      const owner = process.env.ECHOVAULT_OWNER;
      const grantee = process.env.ECHOVAULT_GRANTEE;
      const statusFilter = process.env.ECHOVAULT_GRANT_STATUS;
      const limit = process.env.ECHOVAULT_GRANT_LIMIT;
      const offset = process.env.ECHOVAULT_GRANT_OFFSET;
      const expiresBefore = process.env.ECHOVAULT_GRANT_EXPIRES_BEFORE;
      const expiresAfter = process.env.ECHOVAULT_GRANT_EXPIRES_AFTER;
      const expiresWithin = process.env.ECHOVAULT_GRANT_EXPIRES_WITHIN;
      const qs = new URLSearchParams();
      if (owner) qs.set('owner', owner);
      if (grantee) qs.set('grantee', grantee);
      if (statusFilter) qs.set('status', statusFilter);
      if (limit) qs.set('limit', limit);
      if (offset) qs.set('offset', offset);
      if (expiresBefore) qs.set('expires_before', expiresBefore);
      if (expiresAfter) qs.set('expires_after', expiresAfter);
      if (expiresWithin) qs.set('expires_within', expiresWithin);
      const url = qs.toString() ? `${api}/vault/grants?${qs.toString()}` : `${api}/vault/grants`;
      const result = await getJson<ApiError>(url);
      logResult(result);
    });
}

export { registerGrants };

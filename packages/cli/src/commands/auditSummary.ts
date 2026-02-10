import { Command } from 'commander';
import { getJson } from '../http';
import { getApi, logResult, ApiError } from '../utils';

function registerAuditSummary(program: Command) {
  program
    .command('audit-summary')
    .description('Summarize audit events (dev stub)')
    .action(async () => {
      const api = getApi();
      const owner = process.env.ECHOVAULT_OWNER;
      const grantee = process.env.ECHOVAULT_GRANTEE;
      const action = process.env.ECHOVAULT_AUDIT_ACTION;
      const since = process.env.ECHOVAULT_AUDIT_SINCE;
      const until = process.env.ECHOVAULT_AUDIT_UNTIL;
      const qs = new URLSearchParams();
      if (owner) qs.set('owner', owner);
      if (grantee) qs.set('grantee', grantee);
      if (action) qs.set('action', action);
      if (since) qs.set('since', since);
      if (until) qs.set('until', until);
      const url = qs.toString() ? `${api}/audit/summary?${qs.toString()}` : `${api}/audit/summary`;
      const result = await getJson<ApiError>(url);
      logResult(result);
    });
}

export { registerAuditSummary };

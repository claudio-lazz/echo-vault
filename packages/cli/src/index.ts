#!/usr/bin/env node

import { Command } from 'commander';
import { registerStatus } from './commands/status';
import { registerInit } from './commands/init';
import { registerVault } from './commands/vault';
import { registerVaults } from './commands/vaults';
import { registerGrant } from './commands/grant';
import { registerRevoke } from './commands/revoke';
import { registerGrants } from './commands/grants';
import { registerGrantsSummary } from './commands/grantsSummary';
import { registerAudit } from './commands/audit';
import { registerAuditSummary } from './commands/auditSummary';
import { registerPreview } from './commands/preview';
import { registerRequest } from './commands/request';
import { registerReset } from './commands/reset';

const envHelp = `\nEnv vars:\n  ECHOVAULT_API (default: http://localhost:8787)\n  ECHOVAULT_OWNER, ECHOVAULT_GRANTEE, ECHOVAULT_SCOPE_HASH\n  ECHOVAULT_CONTEXT_URI, ECHOVAULT_CONTEXT_URI_PATH\n  ECHOVAULT_ENCRYPTED_BLOB, ECHOVAULT_ENCRYPTED_BLOB_PATH\n  ECHOVAULT_EXPIRES_AT\n  ECHOVAULT_VAULT_LIMIT, ECHOVAULT_VAULT_OFFSET\n  ECHOVAULT_GRANT_STATUS, ECHOVAULT_GRANT_LIMIT, ECHOVAULT_GRANT_OFFSET\n  ECHOVAULT_GRANT_EXPIRES_BEFORE, ECHOVAULT_GRANT_EXPIRES_AFTER, ECHOVAULT_GRANT_EXPIRES_WITHIN\n  ECHOVAULT_AUDIT_ACTION, ECHOVAULT_AUDIT_LIMIT, ECHOVAULT_AUDIT_OFFSET\n  ECHOVAULT_AUDIT_SINCE, ECHOVAULT_AUDIT_UNTIL\n  ECHOVAULT_PAYMENT_TX, ECHOVAULT_PAYMENT_MINT, ECHOVAULT_PAYMENT_AMOUNT\n  ECHOVAULT_PAYMENT_PAYER, ECHOVAULT_PAYMENT_RECIPIENT\n  ECHOVAULT_RESET_OK=yes\n`;

const program = new Command();
program
  .name('echovault')
  .description('EchoVault CLI (dev stub)')
  .addHelpText('after', envHelp);

registerStatus(program);
registerInit(program);
registerVault(program);
registerVaults(program);
registerGrant(program);
registerRevoke(program);
registerGrants(program);
registerGrantsSummary(program);
registerAudit(program);
registerAuditSummary(program);
registerPreview(program);
registerRequest(program);
registerReset(program);

program
  .command('help')
  .description('Show help')
  .action(() => program.outputHelp());

program.on('command:*', () => {
  console.error('unknown command');
  program.outputHelp();
  process.exit(1);
});

program.parseAsync(process.argv);

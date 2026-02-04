use anchor_lang::prelude::*;

declare_id!("Ech0VaulT11111111111111111111111111111111");

#[program]
pub mod echovault {
    use super::*;

    pub fn init_context_vault(_ctx: Context<InitContextVault>, _context_uri: String) -> Result<()> {
        Ok(())
    }

    pub fn grant_access(_ctx: Context<GrantAccess>, _scope_hash: [u8; 32], _expires_at: i64) -> Result<()> {
        Ok(())
    }

    pub fn revoke_access(_ctx: Context<RevokeAccess>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitContextVault<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: placeholder
    pub owner: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GrantAccess<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    /// CHECK: placeholder
    pub grantee: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevokeAccess<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    /// CHECK: placeholder
    pub grant: UncheckedAccount<'info>,
}

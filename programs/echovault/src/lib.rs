use anchor_lang::prelude::*;

declare_id!("Ech0VaulT11111111111111111111111111111111");

#[program]
pub mod echovault {
    use super::*;

    pub fn init_context_vault(ctx: Context<InitContextVault>, context_uri: String) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.owner = ctx.accounts.owner.key();
        vault.context_uri = context_uri;
        vault.version = 1;
        vault.created_at = Clock::get()?.unix_timestamp;
        vault.updated_at = vault.created_at;
        Ok(())
    }

    pub fn grant_access(ctx: Context<GrantAccess>, scope_hash: [u8; 32], expires_at: i64) -> Result<()> {
        let grant = &mut ctx.accounts.grant;
        grant.owner = ctx.accounts.owner.key();
        grant.grantee = ctx.accounts.grantee.key();
        grant.scope_hash = scope_hash;
        grant.expires_at = expires_at;
        grant.revoked = false;
        grant.created_at = Clock::get()?.unix_timestamp;
        Ok(())
    }

    pub fn update_context_vault(ctx: Context<UpdateContextVault>, context_uri: String) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.context_uri = context_uri;
        vault.version = vault.version.saturating_add(1);
        vault.updated_at = Clock::get()?.unix_timestamp;
        Ok(())
    }

    pub fn revoke_access(ctx: Context<RevokeAccess>) -> Result<()> {
        let grant = &mut ctx.accounts.grant;
        grant.revoked = true;
        let registry = &mut ctx.accounts.registry;
        registry.grant = grant.key();
        registry.revoked_at = Clock::get()?.unix_timestamp;
        Ok(())
    }
}

#[account]
pub struct ContextVault {
    pub owner: Pubkey,
    pub context_uri: String,
    pub version: u64,
    pub created_at: i64,
    pub updated_at: i64,
}

#[account]
pub struct AccessGrant {
    pub owner: Pubkey,
    pub grantee: Pubkey,
    pub scope_hash: [u8; 32],
    pub expires_at: i64,
    pub revoked: bool,
    pub created_at: i64,
}

#[account]
pub struct RevocationRegistry {
    pub grant: Pubkey,
    pub revoked_at: i64,
}

impl ContextVault {
    pub const MAX_URI_LEN: usize = 256;
    pub const LEN: usize = 8 + 32 + 4 + Self::MAX_URI_LEN + 8 + 8 + 8;
}

impl AccessGrant {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 8 + 1 + 8;
}

impl RevocationRegistry {
    pub const LEN: usize = 8 + 32 + 8;
}

#[derive(Accounts)]
pub struct InitContextVault<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: owner is the vault owner
    pub owner: UncheckedAccount<'info>,
    #[account(
        init,
        payer = payer,
        space = ContextVault::LEN,
        seeds = [b"vault", owner.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, ContextVault>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(scope_hash: [u8; 32])]
pub struct GrantAccess<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    /// CHECK: grantee is the agent receiving access
    pub grantee: UncheckedAccount<'info>,
    #[account(
        init,
        payer = owner,
        space = AccessGrant::LEN,
        seeds = [b"grant", owner.key().as_ref(), grantee.key().as_ref(), scope_hash.as_ref()],
        bump
    )]
    pub grant: Account<'info, AccessGrant>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateContextVault<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        mut,
        seeds = [b"vault", owner.key().as_ref()],
        bump,
        has_one = owner
    )]
    pub vault: Account<'info, ContextVault>,
}

#[derive(Accounts)]
pub struct RevokeAccess<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        mut,
        seeds = [b"grant", grant.owner.as_ref(), grant.grantee.as_ref(), grant.scope_hash.as_ref()],
        bump,
        has_one = owner
    )]
    pub grant: Account<'info, AccessGrant>,
    #[account(
        init,
        payer = owner,
        space = RevocationRegistry::LEN,
        seeds = [b"revoke", grant.key().as_ref()],
        bump
    )]
    pub registry: Account<'info, RevocationRegistry>,
    pub system_program: Program<'info, System>,
}

use crate::state::Buyers;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct AddBuyer<'info> {
    #[account(mut, seeds = [b"buyers"], bump = buyers.bump)]
    pub buyers: Account<'info, Buyers>,

    pub buyer: Signer<'info>,
}

pub fn add_buyer(ctx: Context<AddBuyer>, secret: u64) -> Result<()> {
    let buyers = &mut ctx.accounts.buyers;

    buyers.add_buyer(ctx.accounts.buyer.key(), secret)?;

    Ok(())
}

use crate::state::{AuctionInfo, Buyers};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init, payer = authority, space = 8 + AuctionInfo::SIZE,
        seeds = [b"auction_info"], bump
    )]
    pub auction_info: Account<'info, AuctionInfo>,
    #[account(
        init, payer = authority, space = 8 + Buyers::MAX_SIZE,
        seeds = [b"buyers"], bump
    )]
    pub buyers: Account<'info, Buyers>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn initialize(ctx: Context<Initialize>, energy_price: u64) -> Result<()> {
    let auction_info = &mut ctx.accounts.auction_info;
    let buyers = &mut ctx.accounts.buyers;

    auction_info.authority = ctx.accounts.authority.key();
    auction_info.energy_price = energy_price;
    auction_info.bump = *ctx.bumps.get("auction_info").unwrap();
    buyers.bump = *ctx.bumps.get("buyers").unwrap();

    Ok(())
}

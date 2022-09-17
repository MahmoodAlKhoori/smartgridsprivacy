use anchor_lang::prelude::*;

#[account]
pub struct AuctionInfo {
    pub authority: Pubkey,
    pub energy_price: u64,
    pub bump: u8,
}

impl AuctionInfo {
    pub const SIZE: usize = 32 + 8 + 1;
}

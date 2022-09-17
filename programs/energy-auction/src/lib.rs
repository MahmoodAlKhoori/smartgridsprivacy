mod error;
mod instructions;
mod state;

use anchor_lang::prelude::*;
use instructions::*;

declare_id!("tB1RSPPB3NQRdGiL3Buy63h3jHZhF6jJkaXV2McsLD1");

#[program]
pub mod energy_auction {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, energy_price: u64) -> Result<()> {
        instructions::initialize(ctx, energy_price)
    }

    pub fn add_buyer(ctx: Context<AddBuyer>, secret: u64) -> Result<()> {
        instructions::add_buyer(ctx, secret)
    }
}

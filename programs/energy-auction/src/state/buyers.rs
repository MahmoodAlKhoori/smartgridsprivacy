use crate::error::CustomError;
use anchor_lang::prelude::*;

#[account]
pub struct Buyers {
    pubkeys: Vec<Pubkey>,
    secrets: Vec<u64>,
    pub bump: u8,
}

impl Buyers {
    pub const MAX_ITEMS: usize = 50;
    pub const MAX_SIZE: usize = 8 + Self::MAX_ITEMS * (32 + 8) + 1;

    pub fn len(&self) -> usize {
        assert_eq!(self.pubkeys.len(), self.secrets.len());
        self.pubkeys.len()
    }

    pub fn add_buyer(&mut self, pubkey: Pubkey, secret: u64) -> Result<()> {
        require!(self.len() < Self::MAX_ITEMS, CustomError::BuyersTooLarge);

        if self.pubkeys.contains(&pubkey) {
            return err!(CustomError::BuyerAlreadySet);
        }

        self.pubkeys.push(pubkey);
        self.secrets.push(secret);

        Ok(())
    }
}

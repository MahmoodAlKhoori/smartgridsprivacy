use anchor_lang::prelude::*;

#[error_code]
pub enum CustomError {
    #[msg("Max number of buyers reached")]
    BuyersTooLarge,
    #[msg("Buyer already set")]
    BuyerAlreadySet,
}

#!/bin/bash

ENERGY_AUCTION_KEYPAIR_PATH="target/deploy/energy_auction-keypair.json"
ENERGY_AUCTION_SOURCE_PATH="programs/energy-auction/src/lib.rs"

# Generate a new keypair for the program
solana-keygen new --outfile "${ENERGY_AUCTION_KEYPAIR_PATH}" --no-bip39-passphrase --force

# Update program source code with the new program ID
ENERGY_AUCTION_PROGRAM_ID=`solana --keypair "${ENERGY_AUCTION_KEYPAIR_PATH}" address`
sed -i -E 's/^(declare_id!\(")\w+("\);)$/\1'${ENERGY_AUCTION_PROGRAM_ID}'\2/' "${ENERGY_AUCTION_SOURCE_PATH}"

import * as anchor from "@project-serum/anchor";
import { Program, BN } from "@project-serum/anchor";
import { EnergyAuction } from "../target/types/energy_auction";
import { Keypair, SystemProgram } from "@solana/web3.js";
import { sendLamports } from "./utils";
import { expectDeep } from "./helpers";
import { pda } from "../ts/utils";

describe("energy-auction", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const energyAuction = anchor.workspace
    .EnergyAuction as Program<EnergyAuction>;
  const provider = anchor.getProvider() as anchor.AnchorProvider;

  const payer = Keypair.generate();
  const buyers: [Keypair, BN][] = [];

  it("Should fund payer's account", async () => {
    await sendLamports({ provider, to: payer.publicKey });
  });

  it("Should initialize `auction_info` account", async () => {
    const [auctionInfoAddress, auctionInfoBump] = await pda.auctionInfo({
      energyAuction,
    });
    const [buyersAddress, buyersBump] = await pda.buyers({
      energyAuction,
    });

    const energyPrice = new BN(100);

    await energyAuction.methods
      .initialize(energyPrice)
      .accounts({
        auctionInfo: auctionInfoAddress,
        buyers: buyersAddress,
        authority: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([payer])
      .rpc();

    const auctionInfoData = await energyAuction.account.auctionInfo.fetch(
      auctionInfoAddress
    );
    expectDeep(auctionInfoData).include({
      authority: payer.publicKey,
      energyPrice,
      bump: auctionInfoBump,
    });

    const buyersData = await energyAuction.account.buyers.fetch(buyersAddress);
    expectDeep(buyersData).include({
      pubkeys: [],
      secrets: [],
      bump: buyersBump,
    });
  });

  it("Should add a new buyer", async () => {
    const [buyersAddress] = await pda.buyers({
      energyAuction,
    });

    const buyer = Keypair.generate();
    const secret = new BN(1000);
    buyers.push([buyer, secret]);

    await energyAuction.methods
      .addBuyer(secret)
      .accounts({
        buyers: buyersAddress,
        buyer: buyer.publicKey,
      })
      .signers([buyer])
      .rpc();

    const buyersData = await energyAuction.account.buyers.fetch(buyersAddress);
    expectDeep(buyersData).include({
      pubkeys: [buyer.publicKey],
      secrets: [secret],
    });
  });

  it("Should fail if buyer already exists", async () => {
    const [buyersAddress] = await pda.buyers({
      energyAuction,
    });
    const [[buyer]] = buyers;

    try {
      await energyAuction.methods
        .addBuyer(new BN(0))
        .accounts({
          buyers: buyersAddress,
          buyer: buyer.publicKey,
        })
        .signers([buyer])
        .rpc();
    } catch (err) {
      return;
    }
    throw new Error("Instruction did not fail");
  });
});

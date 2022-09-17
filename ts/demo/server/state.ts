import { Address, BN, Program } from "@project-serum/anchor";
import { EnergyAuction } from "../../../target/types/energy_auction";
import { getEnergyAuction } from "../../client";
import { ROOT } from "../../constants";
import { exec, pda } from "../../utils";
import { APP_CLUSTER } from "../config";
import { strict as assert } from "assert";
import { PublicKey, SystemProgram } from "@solana/web3.js";

class AppState {
  private _energyAuction: Program<EnergyAuction> | null = null;
  K: Map<Address, BN> = new Map();
  R: Map<Address, BN> = new Map();

  get energyAuction(): Program<EnergyAuction> {
    assert.ok(this._energyAuction);

    return this._energyAuction;
  }

  get programId(): PublicKey {
    return this.energyAuction.programId;
  }

  async init(energyPrice: BN) {
    this._energyAuction = null;
    this.K.clear();
    this.R.clear();

    await this.deployProgram();
    await this.initializeProgram(energyPrice);
  }

  async getSumU(): Promise<BN> {
    const energyAuction = this.energyAuction;

    const [buyersAddress] = await pda.buyers({ energyAuction });
    const buyersData = await energyAuction.account.buyers.fetch(buyersAddress);

    return buyersData.secrets.reduce((acc, x) => acc.add(x), new BN(0));
  }

  async getAuctionInfo() {
    const energyAuction = this.energyAuction;

    const [auctionInfoAddress] = await pda.auctionInfo({ energyAuction });
    const auctionInfoData = await energyAuction.account.auctionInfo.fetch(
      auctionInfoAddress
    );

    return auctionInfoData;
  }

  private async deployProgram() {
    await exec(`cd ${ROOT} && ./bash/new-program-id.sh`);
    await exec(`anchor build && anchor deploy`);
    this._energyAuction = getEnergyAuction({ cluster: APP_CLUSTER });
  }

  private async initializeProgram(energyPrice: BN) {
    const energyAuction = this.energyAuction;

    const [auctionInfoAddress] = await pda.auctionInfo({
      energyAuction,
    });
    const [buyersAddress] = await pda.buyers({
      energyAuction,
    });

    await energyAuction.methods
      .initialize(energyPrice)
      .accounts({
        auctionInfo: auctionInfoAddress,
        buyers: buyersAddress,
        authority: energyAuction.provider.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }
}

export default new AppState();

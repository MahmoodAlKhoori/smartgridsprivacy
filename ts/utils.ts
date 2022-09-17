import { Program } from "@project-serum/anchor";
import { EnergyAuction } from "../target/types/energy_auction";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { promisify } from "util";
import cp from "child_process";

export const pda = {
  auctionInfo: async ({
    energyAuction,
  }: {
    energyAuction: Program<EnergyAuction>;
  }): Promise<[PublicKey, number]> => {
    const [auctionInfoAddress, auctionInfoBump] =
      await PublicKey.findProgramAddress(
        [Buffer.from("auction_info")],
        energyAuction.programId
      );

    return [auctionInfoAddress, auctionInfoBump];
  },

  buyers: async ({
    energyAuction,
  }: {
    energyAuction: Program<EnergyAuction>;
  }): Promise<[PublicKey, number]> => {
    const [buyersAddress, buyersBump] = await PublicKey.findProgramAddress(
      [Buffer.from("buyers")],
      energyAuction.programId
    );

    return [buyersAddress, buyersBump];
  },
};

function replacer(this: any, key: any, value: any): any {
  if (this[key] instanceof BN) {
    return `bn-${this[key].toString(10)}`;
  } else if (value instanceof PublicKey) {
    return `pk-${value.toBase58()}`;
  } else {
    return value;
  }
}

export const stringify = (obj: any): string => {
  return JSON.stringify(obj, replacer, 2);
};

export const exec = promisify(cp.exec);
export const sleep = (ms: number): Promise<void> => {
  return new Promise((res) => {
    setTimeout(res, ms);
  });
};

export const fmtBNWithPrec = (num: BN, decimals: number): string => {
  const denom = new BN(10 ** decimals);
  const [quot, rem] = [num.div(denom), num.mod(denom)];

  return rem.isZero() ? `${quot}` : `${quot}.${rem}`.replace(/0*$/, "");
};
export const parseBNWithPrec = (num: string | number, decimals: number): BN => {
  if (typeof num === "string") {
    num = parseFloat(num);
  }

  const scale = Math.pow(10, decimals);
  return new BN((num * scale).toFixed(0));
};

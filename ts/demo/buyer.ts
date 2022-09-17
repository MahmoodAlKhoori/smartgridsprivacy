import { Keypair, PublicKey } from "@solana/web3.js";
import { Logger } from "winston";
import { getLogger } from "./logger";
import readline from "readline";
import process from "process";
import BN from "bn.js";
import axios from "axios";
import { ENERGY_AMOUNT_DECIMALS, SERVER_URL } from "./config";
import { parseBNWithPrec, pda } from "../utils";
import { Program } from "@project-serum/anchor";
import { EnergyAuction } from "../../target/types/energy_auction";
import { strict as assert } from "assert";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const question = (query: string): Promise<string> => {
  return new Promise((res, _rej) => {
    rl.question(query, (answer) => {
      res(answer);
    });
  });
};

const readBN = async (
  query: string,
  decimals: number = 0,
  pred: (num: number) => boolean = (n) => n >= 0
) => {
  let num: BN;
  while (true) {
    try {
      const answer = await question(`>>> ${query}`);
      num = parseBNWithPrec(answer, decimals);

      if (pred(parseFloat(answer))) {
        break;
      }
    } catch (err) {}
  }

  return num;
};

export class Buyer {
  id: string;
  private _energyAuction: Program<EnergyAuction> | null = null;
  keypair: Keypair;
  logger: Logger;
  D: BN | null = null;
  R: BN | null = null;
  K: BN | null = null;

  constructor(id: string | number, energyAuction?: Program<EnergyAuction>) {
    this.id = `${id}`;
    this.keypair = Keypair.generate();
    this.logger = getLogger(`buyer-${id}`);
    if (energyAuction) {
      this._energyAuction = energyAuction;
    }

    this.logger.info(`Assigned pubkey: ${this.pubkey}`);
  }

  get pubkey(): PublicKey {
    return this.keypair.publicKey;
  }

  get energyAuction(): Program<EnergyAuction> {
    assert.ok(this._energyAuction);

    return this._energyAuction;
  }

  setClient(energyAuction: Program<EnergyAuction>) {
    this._energyAuction = energyAuction;
  }

  get U(): BN {
    if (!(this.D && this.K && this.R)) {
      throw new Error("Some number has not been set");
    }

    return this.D.add(this.K).add(this.R);
  }

  async readD() {
    this.D = await readBN(
      `Insert energy request (in MWh) of buyer ${this.id}: `,
      ENERGY_AMOUNT_DECIMALS
    );
    this.logger.info(`\`D_${this.id}\` set to ${this.D}`);
  }

  async readR() {
    this.R = await readBN(`Insert \`R_${this.id}\`: `);
    this.logger.info(`\`R_${this.id}\` set to ${this.R}`);
  }

  async registerK() {
    this.K = new BN(Math.random() * 1e12);

    this.logger.info(`Sending \`K\` (${this.K}) to the server...`);
    await axios({
      baseURL: SERVER_URL,
      url: "/register",
      method: "post",
      data: {
        pubkey: this.pubkey,
        k: this.K.toNumber(),
      },
    });
  }

  async registerU() {
    const [buyersAddress] = await pda.buyers({
      energyAuction: this.energyAuction,
    });

    await this.energyAuction.methods
      .addBuyer(this.U)
      .accounts({
        buyers: buyersAddress,
        buyer: this.pubkey,
      })
      .signers([this.keypair])
      .rpc();
    this.logger.info(`\`U\` (${this.U}) registered on-chain`);
  }

  async sendSum(...others: Buyer[]) {
    const buyers = [this, ...others];
    const sum: BN = buyers.reduce((acc, b) => acc.add(b.R!), new BN(0));

    this.logger.info(
      `Sending \`R\` sum (${buyers
        .map((b) => b.R)
        .join(" + ")} = ${sum}) to the server...`
    );
    await axios({
      baseURL: SERVER_URL,
      url: "/send-random-sum",
      method: "post",
      data: {
        pubkey: this.pubkey,
        sum: sum.toNumber(),
      },
    });
  }
}

import { readFileSync } from "fs";
import { Address, AnchorProvider, Wallet } from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Keypair, Connection } from "@solana/web3.js";
import {
  Cluster,
  DEFAULT_KEYPAIR_PATH,
  ENERGY_AUCTION_KEYPAIR_PATH,
  getClusterConfig,
} from "./constants";
import { EnergyAuction, IDL } from "../target/types/energy_auction";

// DEFAULTS

const DEFAULT_CLUSTER = Cluster.Localhost;
const DEFAULT_KEYPAIR = () => readKeypair(DEFAULT_KEYPAIR_PATH);
const DEFAULT_ENERGY_AUCTION_PROGRAM_ID = () =>
  readKeypair(ENERGY_AUCTION_KEYPAIR_PATH).publicKey;

// FACTORIES

interface ConnectionOpts {
  cluster?: Cluster;
}
export const getConnection = (options: ConnectionOpts = {}): Connection => {
  const { cluster = DEFAULT_CLUSTER } = options;
  const clusterCfg = getClusterConfig(cluster);

  return new Connection(clusterCfg.rpcUrl, AnchorProvider.defaultOptions());
};

interface ProviderOpts extends ConnectionOpts {
  wallet?: Wallet;
}
export const getProvider = (options: ProviderOpts = {}): AnchorProvider => {
  const { cluster, wallet = new Wallet(DEFAULT_KEYPAIR()) } = options;

  const conn = getConnection({ cluster });
  return new AnchorProvider(conn, wallet, AnchorProvider.defaultOptions());
};

interface EnergyAuctionOpts extends ProviderOpts {
  programId?: Address;
}
export const getEnergyAuction = (
  options: EnergyAuctionOpts = {}
): Program<EnergyAuction> => {
  const {
    programId = DEFAULT_ENERGY_AUCTION_PROGRAM_ID(),
    cluster,
    wallet,
  } = options;
  const provider = getProvider({ cluster, wallet });

  return new Program<EnergyAuction>(IDL, programId, provider);
};

// UTILS

const readKeypair = (path: string): Keypair => {
  return Keypair.fromSecretKey(
    Buffer.from(JSON.parse(readFileSync(path, { encoding: "utf-8" })))
  );
};

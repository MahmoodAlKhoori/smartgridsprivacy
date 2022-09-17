import path from "path";

// PATHS

export const ROOT = path.join(__dirname, "..");
export const DEFAULT_KEYPAIR_PATH = path.join(
  process.env["HOME"]!,
  ".config/solana/id.json"
);
export const ENERGY_AUCTION_KEYPAIR_PATH = path.join(
  ROOT,
  "target/deploy/energy_auction-keypair.json"
);

// PROGRAM CONSTANTS

export const ENERGY_PRICE_DECIMALS = 2;

// SOLANA CLUSTERS

export enum Cluster {
  Localhost,
  Devnet,
}

interface ClusterConfig {
  rpcUrl: string;
}
export const getClusterConfig = (cluster: Cluster): ClusterConfig => {
  switch (cluster) {
    case Cluster.Devnet:
      return {
        rpcUrl: "https://api.devnet.solana.com",
      };
    case Cluster.Localhost:
      return {
        rpcUrl: "http://127.0.0.1:8899",
      };
  }
};

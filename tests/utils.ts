import * as anchor from "@project-serum/anchor";
import {
  PublicKey,
  Keypair,
  Transaction,
  TransactionSignature,
  SystemProgram,
} from "@solana/web3.js";

export const sendLamports = async ({
  provider,
  to,
  from,
  lamports = 1_000_000_000,
}: {
  provider: anchor.AnchorProvider;
  to: PublicKey;
  lamports?: number;
  from?: Keypair;
}): Promise<TransactionSignature> => {
  const tx = new Transaction();
  tx.add(
    SystemProgram.transfer({
      fromPubkey: from ? from.publicKey : provider.wallet.publicKey,
      toPubkey: to,
      lamports,
    })
  );
  const txSignature = await provider.sendAndConfirm(tx, from ? [from] : []);

  return txSignature;
};

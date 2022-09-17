import axios from "axios";
import { getEnergyAuction } from "../client";
import { sleep } from "../utils";
import { Buyer } from "./buyer";
import {
  NUM_BUYERS,
  ROUND_TIMEOUT_SECS,
  SERVER_PORT,
  SERVER_URL,
} from "./config";
import { getLogger } from "./logger";
import * as server from "./server";
import { InitNewAuctionReplyType } from "./server/schemas";

const logger = getLogger("app");

const initNewAuction = async (): Promise<InitNewAuctionReplyType> => {
  return await axios({
    baseURL: SERVER_URL,
    url: "/init-new-auction",
    method: "post",
    data: {},
  }).then((res) => {
    return res.data;
  });
};

const main = async () => {
  await server.start({ port: SERVER_PORT });

  const buyers = [...Array(NUM_BUYERS)].map((_, idx) => new Buyer(idx));

  while (true) {
    const { programId } = await initNewAuction();
    const energyAuction = getEnergyAuction({ programId });

    const activeBuyers: Buyer[] = [];
    for (const buyer of buyers) {
      buyer.setClient(energyAuction);

      await buyer.readD();
      if (buyer.D!.isZero()) {
        continue;
      }

      await buyer.readR();
      await buyer.registerK();
      await buyer.registerU();
      activeBuyers.push(buyer);
    }

    const groups: Buyer[][] = [];
    for (let i = 0; i < activeBuyers.length; i += 2) {
      groups.push(activeBuyers.slice(i, i + 2));
    }
    if (groups.length > 1 && groups[groups.length - 1].length < 2) {
      const last = groups.pop();
      groups[groups.length - 1].push(...last!);
    }
    for (const grp of groups) {
      const idx = Math.floor((grp.length - 1) / 2);
      const buyer = grp.splice(idx, 1).pop()!;
      await buyer.sendSum(...grp);
    }

    await sleep(ROUND_TIMEOUT_SECS * 1000);
  }
};

main().catch((err) => {
  logger.error(err);
  process.exit(1);
});

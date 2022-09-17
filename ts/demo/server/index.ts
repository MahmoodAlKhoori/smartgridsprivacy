import { BN } from "@project-serum/anchor";
import Fastify, { FastifyListenOptions } from "fastify";
import { ENERGY_PRICE_DECIMALS } from "../../constants";
import { fmtBNWithPrec, parseBNWithPrec } from "../../utils";
import { ENERGY_AMOUNT_DECIMALS } from "../config";
import { getLogger } from "../logger";
import * as schemas from "./schemas";
import state from "./state";

const logger = getLogger("utility");

export const app = Fastify({
  logger: false,
});

app.post<{
  Body: schemas.InitNewAuctionBodyType;
  Reply: schemas.InitNewAuctionReplyType;
}>(
  "/init-new-auction",
  {
    schema: {
      body: schemas.InitNewAuctionBody,
      response: {
        200: schemas.InitNewAuctionReply,
      },
    },
  },
  async (_req, rep) => {
    const [minPrice, maxPrice] = [50, 100].map((n) =>
      parseBNWithPrec(n, ENERGY_PRICE_DECIMALS)
    );
    const randOffset = Math.floor(
      Math.random() * maxPrice.sub(minPrice).addn(1).toNumber()
    );
    const randPrice = minPrice.addn(randOffset);

    try {
      await state.init(randPrice);
    } catch (err) {
      logger.error(err);
      throw err;
    }
    logger.info(
      `New energy offer available at $${fmtBNWithPrec(
        randPrice,
        ENERGY_PRICE_DECIMALS
      )}/MWh`
    );
    logger.info(`Program Id: ${state.programId}`);

    rep.status(200).send({ programId: state.programId.toString() });
  }
);

app.post<{
  Body: schemas.RegisterBodyType;
  Reply: schemas.RegisterReplyType;
}>(
  "/register",
  {
    schema: {
      body: schemas.RegisterBody,
      response: {
        200: schemas.RegisterReply,
      },
    },
  },
  async (req, rep) => {
    const { pubkey, k } = req.body;
    const { K } = state;

    if (K.has(pubkey)) {
      return rep.code(400).send({ error: "Pubkey already registered" });
    }

    K.set(pubkey, new BN(k));
    logger.info(`\`K\` set to ${k} by ${pubkey}`);

    return rep.code(200).send({});
  }
);

app.post<{
  Body: schemas.SendRandomSumBodyType;
  Reply: schemas.SendRandomSumReplyType;
}>(
  "/send-random-sum",
  {
    schema: {
      body: schemas.SendRandomSumBody,
      response: {
        200: schemas.SendRandomSumReply,
      },
    },
  },
  async (req, rep) => {
    const { pubkey, sum } = req.body;
    const { R, K } = state;

    if (R.has(pubkey)) {
      return rep.code(400).send({ error: "Sum already registered" });
    }

    R.set(pubkey, new BN(sum));
    logger.info(`\`R\` sum set to ${sum} by ${pubkey}`);

    if (R.size >= Math.floor(K.size / 2)) {
      const sumU = await state.getSumU();
      const sumK = Array.from(K.values()).reduce(
        (acc, x) => acc.add(x),
        new BN(0)
      );
      const sumR = Array.from(R.values()).reduce(
        (acc, x) => acc.add(x),
        new BN(0)
      );

      const sumD = sumU.sub(sumK.add(sumR));
      const { energyPrice } = await state.getAuctionInfo();

      logger.info(
        `sumD = sumU - (sumK + sumR) = ${sumU} - (${sumK} + ${sumR}) = ${sumD}`
      );
      logger.info(
        `Total energy request: ${fmtBNWithPrec(
          sumD,
          ENERGY_AMOUNT_DECIMALS
        )} MWh`
      );
      logger.info(
        `Total cost: $${fmtBNWithPrec(
          sumD.mul(energyPrice),
          ENERGY_PRICE_DECIMALS + ENERGY_AMOUNT_DECIMALS
        )}`
      );
    }

    return rep.code(200).send({});
  }
);

export const start = async (options: FastifyListenOptions) => {
  const url = await app.listen(options);
  logger.info(`Started server on ${url}`);

  return url;
};

export default app;

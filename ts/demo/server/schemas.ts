import { Static, Type } from "@sinclair/typebox";

export const InitNewAuctionBody = Type.Object({});
export const InitNewAuctionReply = Type.Object({
  programId: Type.String(),
});
export type InitNewAuctionBodyType = Static<typeof InitNewAuctionBody>;
export type InitNewAuctionReplyType = Static<typeof InitNewAuctionReply>;

export const RegisterBody = Type.Object({
  pubkey: Type.String(),
  k: Type.Number(),
});
export const RegisterReply = Type.Object({});
export type RegisterBodyType = Static<typeof RegisterBody>;
export type RegisterReplyType = Static<typeof RegisterReply>;

export const SendRandomSumBody = Type.Object({
  pubkey: Type.String(),
  sum: Type.Number(),
});
export const SendRandomSumReply = Type.Object({});
export type SendRandomSumBodyType = Static<typeof SendRandomSumBody>;
export type SendRandomSumReplyType = Static<typeof SendRandomSumReply>;

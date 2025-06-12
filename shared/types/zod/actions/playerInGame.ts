import z from "zod";

export const ReqPlayerIsInGame = ReqBuilder(
  WebsocketTypes.PlayerIsInGame,
  {}
)
export type ReqPlayerIsInGame = z.infer<typeof ReqPlayerIsInGame>;

export const ResPlayerIsInGame = makeSocketResponse(
  WebsocketTypes.PlayerIsInGame,
  z.object({
    allowed: z.boolean(),
    playerCount: z.number(),
    maxPlayers: z.number()
  }),
);
export type ResPlayerIsInGame = z.infer<typeof ResPlayerIsInGame>;
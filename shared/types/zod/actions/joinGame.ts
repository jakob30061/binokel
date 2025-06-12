import z from "zod";

export const ReqJoinGameData = ReqBuilder(
  WebsocketTypes.JoinGame,
  {}
)
export type ReqJoinGameData = z.infer<typeof ReqJoinGameData>;


export const ResNewPlayerJoined = makeSocketResponse(
  WebsocketTypes.NEW_PLAYER_JOINED,
  z.object({
    playerCount: z.number(),
    currentPlayerCount: z.number(),
  }),
);
export type ResNewPlayerJoined = z.infer<typeof ResNewPlayerJoined>;


export const ResJoinGame = makeSocketResponse(
  WebsocketTypes.JoinGame,
  z.object({
    gamePin:           z.string(),
    passwordProtected: z.boolean().nullable().optional(),
  }),
);
export type ResJoinGame = z.infer<typeof ResJoinGame>;



export const JoinGameWithPasswordData = z.object({
  action: z.string(WebsocketTypes.JoinGameWithPassword),
  data: z.interface({
    gamePin:  z.string().length(5),
    password: z.string(),
    playerUUID:   z.string(),
  })
});
export type JoinGameWithPassword = z.infer<typeof JoinGameWithPasswordData>;
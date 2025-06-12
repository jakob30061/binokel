import z from 'zod'

export const ReqCreateGameData = z.object({
  action: z.literal(WebsocketTypes.CreateGame),
  data: z.interface({
    playerUUID: z.string(),
    maxPlayer: z.union([z.literal(3), z.literal(4)]),
    aiPlayer: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
    rules: z.object({
      deckTheme: z.enum(CardDeck).optional(),
      rounds: z.int().optional()
    }),
    password: z.string().nullable().optional(),
  })
});
export type ReqCreateGameData = z.infer<typeof ReqCreateGameData>;

export const ResCreateGame = makeSocketResponse(
  WebsocketTypes.CreateGame,
  z.object({
    game: z.any(), // TODO fix better type
  }),
);
export type ResCreateGame = z.infer<typeof ResCreateGame>;
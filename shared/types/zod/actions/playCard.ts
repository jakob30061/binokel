import z from "zod";
import { CardSchema } from "../generel";

export const ReqPlayCardData = ReqBuilder(
  WebsocketTypes.PLAY_CARD,
  {
    card: CardSchema,
  }
);
export type ReqPlayCardData = z.infer<typeof ReqPlayCardData>;

export const ResCardPlayed = makeSocketResponse(
  WebsocketTypes.PLAY_CARD,
  z.object({
    table: z.array(CardSchema),
    /*opponents: z.array( // TODO add so we can reduce cards for players
      z.object({
        position:  z.string(),
        cards: z.number(),
      })
    ), */
    isMyPlayTurn: z.boolean(),
  })
);
export type ResCardPlayed = z.infer<typeof ResCardPlayed>;

export const ResCardPlayedAccepted = makeSocketResponse(
  WebsocketTypes.PLAYED_CARD_ACCEPTED,
  z.object({
    card: CardSchema
  })
);
export type ResCardPlayedAccepted = z.infer<typeof ResCardPlayedAccepted>;
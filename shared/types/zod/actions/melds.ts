import z from "zod";
import { CardSchema } from "../generel";

export const ReqMakeMeldData = ReqBuilder(
  WebsocketTypes.MakeMeld,
  {
    totalPoints: z.int(),
    melds: z.array(
      z.object({
        name: z.enum(MeldType),
        cards: z.array(CardSchema),
        points: z.number()
      })
    ),
  }
)
export type ReqMakeMeldData = z.infer<typeof ReqMakeMeldData>;

export const ResMeldData = makeSocketResponse(
  WebsocketTypes.MakeMeld,
  z.object({
    isMyTurnToMeld: z.string() // TODO change to boolean
  })
)
export type ResMeldData = z.infer<typeof ResMeldData>; 
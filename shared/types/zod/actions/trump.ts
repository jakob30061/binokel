import z from "zod"

export const ReqSetTrumpData = ReqBuilder(
  WebsocketTypes.SetTrump,
  {
    trump: z.enum(CardSuit)
  }
)
export type ReqSetTrumpData = z.infer<typeof ReqSetTrumpData>;

export const ResTrumpData = makeSocketResponse(
  WebsocketTypes.SetTrump,
  z.object({
    trump: z.enum(CardSuit)
  })
)
export type ResTrumpData = z.infer<typeof ResTrumpData>; 
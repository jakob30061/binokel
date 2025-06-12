import z from "zod"

export const ReqReizenData = ReqBuilder(
  WebsocketTypes.Reizen,
  {
    amount: z.int().optional(),
    pass: z.boolean().default(false).optional()
  }
)
export type ReqReizenData = z.infer<typeof ReqReizenData>;

export const ResReizen = makeSocketResponse(
  WebsocketTypes.Reizen,
  z.object({
    playerUUID: z.string(),
    amount: z.int()
  }).or(z.object({
    playerUUID: z.string(),
    passed: z.boolean().default(false)
  }))
);
export type ResReizen = z.infer<typeof ResReizen>;
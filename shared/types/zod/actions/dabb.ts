import z from "zod"
import { ReqBuilder } from "../helper"

export const ReqDabbData = ReqBuilder(
  WebsocketTypes.SUBMIT_DABB,
  {
    swap: z.array(
      z.tuple([
        z.number(),
        z.number()
      ])
    ).max(4)
  }
);
export type ReqDabbData = z.infer<typeof ReqDabbData>;
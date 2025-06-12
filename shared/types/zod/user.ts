import * as z from "zod";

export const CreateUserData = z.interface({
  language: z.string().default("en")
})
export type CreateUserData = z.infer<typeof CreateUserData>;
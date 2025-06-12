import z from "zod";

export const CardSchema = z.object({
  id:    z.int(),
  value: z.enum(CardRank),
  type:  z.enum(CardSuit),
  copy: z.enum(CardCopy)
})


export const CardsSchema = z.object({
  cards: z.object({
    blatt: z.enum(CardDeck),
    own: z.array(CardSchema),
    opponents: z.array(
      z.object({
        position:  z.string(),
        cards: z.int(),
      })
    ),
    table: z.array(CardSchema),
  })
})
export type CardsSchema = z.infer<typeof CardsSchema>;
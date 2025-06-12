import z from "zod";
import { CardSchema, CardsSchema } from "../generel";

export const ReqGameStateData = ReqBuilder(
  WebsocketTypes.GameState,
  {}
);
export type ReqGameStateData = z.infer<typeof ReqGameStateData>;


/* REIZEN */
export const ResReizenSchema = z.object({
  isMyReizTurn: z.boolean(),
  currentValue: z.int()
})
.extend(CardsSchema)
export type ResReizenSchema = z.infer<typeof ResReizenSchema>;

const ReizWinnerSchema = z.object({
  reizen: z.object({
    reizValue: z.int(),
    reizWinner: z.string(),
  })
})

/* TRUMP */
export const ResTrumpSchema = z.object({
  iCanSelectTrump: z.boolean(),
})
.extend(ReizWinnerSchema)
.extend(CardsSchema)
export type ResTrumpSchema = z.infer<typeof ResTrumpSchema>;

const TrumpSuitSchema = z.object({
  trump: z.enum(CardSuit),
})

/* MELDEN */
export const ResMeldedSchema = z.object({
  isMyMeldTurn: z.boolean(),
  possibleMelds: z.object({}).optional(),
})
.extend(ReizWinnerSchema)
.extend(TrumpSuitSchema)
.extend(CardsSchema)

export type ResMeldedSchema = z.infer<typeof ResMeldedSchema>;

const MeldedPointsSchema = z.object({
  melded: z.array(
    z.object({
      playerUUID: z.string(), // TODO remove UUID
      points: z.number()
    })
  )
  
})

/* PLAY */
export const ResPlaySchema = z.object({
 isMyPlayTurn: z.boolean(),
 turns: z.array(CardSchema)
})
.extend(TrumpSuitSchema)
.extend(ReizWinnerSchema)
.extend(MeldedPointsSchema)
.extend(CardsSchema)
export type ResPlaySchema = z.infer<typeof ResPlaySchema>;


const ReizenVariant = z
  .object({ state: z.literal(RoundState.REIZING) })
  .extend(ResReizenSchema);

const TrumpVariant = z
  .object({ state: z.literal(RoundState.TRUMP_SELECTION) })
  .extend(ResTrumpSchema);

const MeldedVariant = z
  .object({ state: z.literal(RoundState.MELDING) })
  .extend(ResMeldedSchema);

const PlayVariant = z
  .object({ state: z.literal(RoundState.PLAYING) })
  .extend(ResPlaySchema);

export const ResRoundState =  makeSocketResponse(
  WebsocketTypes.GameState,
  z.union([
    ReizenVariant,
    TrumpVariant,
    MeldedVariant,
    PlayVariant,
  ])
)
export type ResRoundState = z.infer<typeof ResRoundState>;
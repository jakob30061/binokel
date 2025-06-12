import { GameError } from "~/server/websocket/errorWrapper";
import { getMeldPoints } from "../getMeldPoints";

export function detectTrumpSeven(
  cardsBySuitAndRank: Record<CardSuit, Record<CardRank, Card[]>>,
  results: Meld[],
  trump: CardSuit
) {
  const sevensOfTrump = cardsBySuitAndRank[trump][CardRank.SIEBEN];
  for (const c of sevensOfTrump) {
    const meld: Meld = {
      name:  MeldType.DIX,
      cards: [c],
      points: 0 // needs to be replaced
    }

    meld.points = getMeldPoints(meld, trump)
    if(meld.points === 0)
      throw new GameError("") // TODO better error handling

    results.push(meld)
  }
}
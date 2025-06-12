import { GameError } from "~/server/websocket/errorWrapper"
import { getMeldPoints } from "../getMeldPoints"

export function detectFourAndEight(
  cardsBySuitAndRank: Record<CardSuit, Record<CardRank, Card[]>>,
  results: Meld[],
  trump: CardSuit
) {
  const suits = Object.values(CardSuit) as CardSuit[]

  // 1) Acht Gleiche: need >=2 cards of the same rank in every suit
  for (const rank of Object.values(CardRank) as CardRank[]) {
    if (suits.every(s => cardsBySuitAndRank[s][rank].length >= 2)) {
      // pull two from each suit
      const used: Card[] = []
      for (const s of suits) {
        used.push(...cardsBySuitAndRank[s][rank].splice(0, 2))
      }
      const meld: Meld = {
        name:   MeldType.ACHT,
        cards:  used,
        points: 0, // placeholder
      }
      meld.points = getMeldPoints(meld, trump)

      if(meld.points === 0)
        throw new GameError("") // TODO better error handling

      results.push(meld)
    }
  }

  // 2) Vier Gleiche: need >=1 card of the same rank in every suit,
  //    but only for Ass, König, Ober, Unter (Zehn/Sieben = 0 Punkte)
  const vierRanks = [
    CardRank.ASS,
    CardRank.KÖNIG,
    CardRank.OBER,
    CardRank.UNTER,
  ]
  for (const rank of vierRanks) {
    if (suits.every(s => cardsBySuitAndRank[s][rank].length >= 1)) {
      // pull one from each suit
      const used: Card[] = []
      for (const s of suits) {
        used.push(cardsBySuitAndRank[s][rank].splice(0, 1)[0])
      }
      const meld: Meld = {
        name:   MeldType.VIER,
        cards:  used,
        points: 0, // placeholder
      }
      meld.points = getMeldPoints(meld, trump)

      if(meld.points === 0)
        throw new GameError("") // TODO better error handling

      results.push(meld)
    }
  }
}
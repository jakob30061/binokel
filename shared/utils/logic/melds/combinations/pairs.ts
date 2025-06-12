import { getMeldPoints } from "../getMeldPoints"

export function detectPairs(
  cardsBySuitAndRank: Record<CardSuit, Record<CardRank, Card[]>>,
  results: Meld[],
  trump: CardSuit,
  suitsWithFamily: CardSuit[]
) {
  for (const suit of Object.values(CardSuit)) {
    // don’t meld König+Ober if this suit already produced a Familie
    if (suitsWithFamily.includes(suit)) continue

    const kings = cardsBySuitAndRank[suit][CardRank.KÖNIG]
    const obers = cardsBySuitAndRank[suit][CardRank.OBER]
    if (kings.length >= 1 && obers.length >= 1) {
      const meld: Meld = {
        name: MeldType.PAAR,
        cards: [kings[0], obers[0]],
        points: 0,  // will be filled by getMeldPoints
      }
      results.push({
        ...meld,
        points: getMeldPoints(meld, trump),
      })
    }
  }
}
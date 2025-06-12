import { GameError } from "~/server/websocket/errorWrapper";
import { getMeldPoints } from "../getMeldPoints";

export function detectFamilies(
  cardsBySuitAndRank: Record<CardSuit, Record<CardRank, Card[]>>,
  results: Meld[],
  trump: CardSuit
) {
  const suitsWithFamily: CardSuit[] = [];
  // The five ranks that make up a family (exclude Sieben)
  const famRanks = [
    CardRank.UNTER,
    CardRank.OBER,
    CardRank.KÖNIG,
    CardRank.ZEHN,
    CardRank.ASS,
  ]

  for (const suit of Object.values(CardSuit)) {
    // 1) doppelte Familie?
    const hasDoubleFam = famRanks.every(
      (r) => cardsBySuitAndRank[suit][r].length >= 2
    )
    if (hasDoubleFam) {
      // grab two of each
      const meldCards = famRanks.flatMap((r) =>
        cardsBySuitAndRank[suit][r].slice(0, 2)
      )
      const meld: Meld = {
        name: MeldType.DOPPELTE_FAMILIE,
        cards: meldCards,
        points: 0,  // placeholder
      }

      meld.points = getMeldPoints(meld, trump)

      if(meld.points === 0)
        throw new GameError("") // TODO better error handling

      results.push(meld)
      suitsWithFamily.push(suit)
      continue
    }

    // 2) single Familie?
    const hasSingleFam = famRanks.every(
      (r) => cardsBySuitAndRank[suit][r].length >= 1
    )
    if (hasSingleFam) {
      // grab one of each
      const meldCards: Card[] = famRanks.map((r) =>
        cardsBySuitAndRank[suit][r][0]!
      )

      const meld: Meld = {
        name: MeldType.FAMILIE,
        cards: meldCards,
        points: 0,
      }

      // compute and validate
      meld.points = getMeldPoints(meld, trump)
      if (meld.points === 0) {
        throw new GameError(
          `Familie meld in suit ${suit} yielded 0 points`
        )
      }

      // commit
      results.push(meld)
      suitsWithFamily.push(suit)
    }
  }

  return suitsWithFamily
}
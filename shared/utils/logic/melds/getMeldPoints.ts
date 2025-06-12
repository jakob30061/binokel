/**
 * Static points. Not affected by
 * trump color
 */
const StaticMeldPoints: Record<
  | MeldType.BINOKEL
  | MeldType.DOPPELTER_BINOKEL
  | MeldType.ACHT
  | MeldType.DOPPELTE_FAMILIE,
  number
> = {
  [MeldType.BINOKEL]:             40,
  [MeldType.DOPPELTER_BINOKEL]:   300,
  [MeldType.ACHT]:                1000,
  [MeldType.DOPPELTE_FAMILIE]:    1500,
}

/**
 * Calculates the correct point‐value for *any* meld,
 * given the meld itself and which suit is trump.
 */
export function getMeldPoints(
  meld: Meld,
  trump: CardSuit
): number {

  switch (meld.name) {
    // Static melds points
    case MeldType.BINOKEL:
    case MeldType.DOPPELTER_BINOKEL:
    case MeldType.ACHT:
    case MeldType.DOPPELTE_FAMILIE:
      return StaticMeldPoints[meld.name]

    // Vier Gleiche
    case MeldType.VIER: {
      // pick the rank of any one card in the meld
      const rank = meld.cards[0]?.value
      switch (rank) {
        case CardRank.ASS:   return 100
        case CardRank.KÖNIG: return  80
        case CardRank.OBER:  return  60
        case CardRank.UNTER: return  40
        default:             return   0  // Zehn/Sieben count for 0
      }
    }

    // Familie: 100 normally, 150 if it’s the trump suit
    case MeldType.FAMILIE: {
      const suit = meld.cards[0]?.type
      return suit === trump ? 150 : 100
    }

    // Paar (König+Ober): 20 normally, 40 if trump
    case MeldType.PAAR: {
      const suit = meld.cards[0]?.type
      return suit === trump ? 40 : 20
    }

    // Dix (Trump-7)
    case MeldType.DIX:
      return 10

    default:
      return 0
  }
}
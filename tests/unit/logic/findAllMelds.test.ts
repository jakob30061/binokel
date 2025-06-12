// @vitest-environment nuxt

import { describe, it, expect } from 'vitest'
import { makeCard, getFullHand } from '~/tests/helper'

describe('findAllMelds', () => {
  it('detects a single Familie (non-trump)', async () => {
    const ranks: CardRank[] = [
      CardRank.UNTER,
      CardRank.OBER,
      CardRank.KÖNIG,
      CardRank.ZEHN,
      CardRank.ASS,
    ]
    const base: Card[] = ranks.map((rank, idx) =>
      makeCard(CardSuit.SCHELLEN, rank, idx + 1)
    )
    const hand = getFullHand(base, CardSuit.HERZ, 3)

    const melds = await findAllMelds(hand, CardSuit.HERZ)
    expect(melds).toEqual([
      expect.objectContaining({
        name: MeldType.FAMILIE,
        cards: expect.arrayContaining(base),
        points: 100,
      }),
      expect.objectContaining({
        cards: [],
        name: "NOTHING",
        points: 0,
      })
    ])
  })

  it('detects a single Familie in trump', async () => {
    const suit = CardSuit.HERZ
    const ranks: CardRank[] = [
      CardRank.UNTER,
      CardRank.OBER,
      CardRank.KÖNIG,
      CardRank.ZEHN,
      CardRank.ASS,
    ]
    const base: Card[] = ranks.map((rank, idx) =>
      makeCard(suit, rank, idx + 1)
    )
    const hand = getFullHand(base, suit, 3)

    const melds = await findAllMelds(hand, suit)
    expect(melds).toEqual([
      expect.objectContaining({
        name: MeldType.FAMILIE,
        points: 150,
      }),
      expect.objectContaining({
        cards: [],
        name: "NOTHING",
        points: 0,
      })
    ])
  })

  it('detects a doppelte Familie', async () => {
    const suit = CardSuit.EICHEL
    const base: Card[] = [
      ...[CardRank.UNTER, CardRank.UNTER,
        CardRank.OBER, CardRank.OBER,
        CardRank.KÖNIG, CardRank.KÖNIG,
        CardRank.ZEHN, CardRank.ZEHN,
        CardRank.ASS, CardRank.ASS].map((rank, i) =>
        makeCard(suit, rank, i + 1)
      )
    ]
    const hand = getFullHand(base, CardSuit.SCHELLEN, 3)
    const melds = await findAllMelds(hand, CardSuit.SCHELLEN)
    expect(melds).toEqual([
      expect.objectContaining({
        name: MeldType.DOPPELTE_FAMILIE,
        points: 1500,
        cards: expect.arrayContaining(base),
      }),
      expect.objectContaining({
        cards: [],
        name: "NOTHING",
        points: 0,
      })
    ])
  })

  it('detects a Paar (König+Ober) when no Familie (non-trump)', async () => {
    const suit = CardSuit.SCHIPPEN
    const hand: Card[] = [
      makeCard(suit, CardRank.KÖNIG, 1),
      makeCard(suit, CardRank.OBER, 2),
    ]
    const melds = await findAllMelds(hand, CardSuit.EICHEL)
    expect(melds).toEqual([
      expect.objectContaining({
        name: MeldType.PAAR,
        cards: expect.arrayContaining(hand),
        points: 20,
      }),
      expect.objectContaining({
        cards: [],
        name: "NOTHING",
        points: 0,
      })
    ])
  })

  it('detects a Paar in trump', async () => {
    const suit = CardSuit.SCHIPPEN
    const hand: Card[] = [
      makeCard(suit, CardRank.KÖNIG, 1),
      makeCard(suit, CardRank.OBER, 2),
    ]

    const melds = await findAllMelds(hand, suit)
    expect(melds).toEqual([
      expect.objectContaining({
        name: MeldType.PAAR,
        cards: expect.arrayContaining(hand),
        points: 40,
      }),
      expect.objectContaining({
        cards: [],
        name: "NOTHING",
        points: 0,
      })
    ])
  })

  it('returns no melds when nothing matches', async () => {
    const base: Card[] = [
      makeCard(CardSuit.EICHEL, CardRank.SIEBEN, 1),
      makeCard(CardSuit.HERZ, CardRank.ZEHN, 2),
    ]
    const hand = getFullHand(base, CardSuit.SCHELLEN, 3)
    const melds = await findAllMelds(hand, CardSuit.SCHELLEN)
    expect(melds).toEqual([
      expect.objectContaining({
        cards: [],
        name: "NOTHING",
        points: 0,
      })
    ])
  })

  it('detects binokel', async () => {
    const hand = [
      makeCard(CardSuit.SCHELLEN, CardRank.UNTER, 1),
      makeCard(CardSuit.SCHIPPEN, CardRank.OBER, 2),
    ]

    const melds = await findAllMelds(hand, CardSuit.HERZ)
    expect(melds).toEqual([
      expect.objectContaining({
        name: MeldType.BINOKEL,
        cards: expect.arrayContaining(hand),
        points: 40,
      }),
      expect.objectContaining({
        cards: [],
        name: "NOTHING",
        points: 0,
      })
    ])
  })

  it('detects double binokel', async () => {
    const hand = [
      makeCard(CardSuit.SCHELLEN, CardRank.UNTER, 1),
      makeCard(CardSuit.SCHIPPEN, CardRank.OBER, 2),
      makeCard(CardSuit.SCHELLEN, CardRank.UNTER, 3),
      makeCard(CardSuit.SCHIPPEN, CardRank.OBER, 4),
    ]

    const melds = await findAllMelds(hand, CardSuit.HERZ)
    expect(melds).toEqual([
      expect.objectContaining({
        name: MeldType.DOPPELTER_BINOKEL,
        cards: expect.arrayContaining(hand),
        points: 300,
      }),
      expect.objectContaining({
        cards: [],
        name: "NOTHING",
        points: 0,
      })
    ])
  })
})

// @vitest-environment nuxt

import { describe, it, expect } from 'vitest'
import { makeCard } from '~/tests/helper'

describe('aiTest', () => {
  it('idk yet', () => {
    const hand = [
      makeCard(CardSuit.EICHEL, CardRank.UNTER, 1),
      makeCard(CardSuit.EICHEL, CardRank.KÖNIG, 2),
      makeCard(CardSuit.EICHEL, CardRank.ZEHN, 3),
      makeCard(CardSuit.HERZ, CardRank.OBER, 4),
      makeCard(CardSuit.HERZ, CardRank.KÖNIG, 5),
      makeCard(CardSuit.SCHIPPEN, CardRank.ASS, 6),
    ]
    const table = [
      makeCard(CardSuit.SCHELLEN, CardRank.ASS, 10),
      makeCard(CardSuit.SCHELLEN, CardRank.OBER, 11)
    ]

    const moves = getPossibleMoves(hand, CardSuit.HERZ, table)
    expect(moves).toEqual([
      makeCard(CardSuit.HERZ, CardRank.OBER, 4),
      makeCard(CardSuit.HERZ, CardRank.KÖNIG, 5)
    ])
    expect(moves).not.toBe([
      makeCard(CardSuit.EICHEL, CardRank.UNTER, 1),
      makeCard(CardSuit.EICHEL, CardRank.KÖNIG, 2),
      makeCard(CardSuit.EICHEL, CardRank.ZEHN, 3),
      makeCard(CardSuit.SCHIPPEN, CardRank.ASS, 6)
    ])
  })
})
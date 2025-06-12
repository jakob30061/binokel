// @vitest-environment nuxt

import { describe, it, expect } from 'vitest'
import { makeCard } from '~/tests/helper'

describe('getPossibleMoves', () => {
  it('returns full hand when table is empty', () => {
    const hand = [
      makeCard(CardSuit.HERZ, CardRank.SIEBEN, 1),
      makeCard(CardSuit.SCHELLEN, CardRank.ASS, 2)
    ]
    const moves = getPossibleMoves(hand, CardSuit.HERZ, [])
    expect(moves).toEqual(hand)
    expect(moves).not.toBe(hand)
  })

  it('follows suit when possible but does not beat highest', () => {
    const table = [makeCard(CardSuit.SCHELLEN, CardRank.OBER, 10)]
    const hand = [
      makeCard(CardSuit.SCHELLEN, CardRank.UNTER, 1),
      makeCard(CardSuit.HERZ, CardRank.ASS, 2)
    ]
    const moves = getPossibleMoves(hand, CardSuit.HERZ, table)
    expect(moves).toEqual([hand[0]])
  })

  it('follows suit and plays winning cards when possible', () => {
    const table = [makeCard(CardSuit.HERZ, CardRank.OBER, 10)]
    const hand = [
      makeCard(CardSuit.HERZ, CardRank.UNTER, 1),
      makeCard(CardSuit.HERZ, CardRank.ASS, 2),
      makeCard(CardSuit.SCHELLEN, CardRank.ASS, 3)
    ]
    const moves = getPossibleMoves(hand, CardSuit.SCHELLEN, table)
    expect(moves).toEqual([hand[1]])
  })

  it('plays trumps when no follow-suit cards', () => {
    const table = [makeCard(CardSuit.SCHIPPEN, CardRank.KÖNIG, 10)]
    const hand = [
      makeCard(CardSuit.SCHELLEN, CardRank.UNTER, 1),
      makeCard(CardSuit.HERZ, CardRank.SIEBEN, 2),
      makeCard(CardSuit.HERZ, CardRank.ZEHN, 3)
    ]
    const moves = getPossibleMoves(hand, CardSuit.HERZ, table)
    expect(moves).toEqual([hand[1], hand[2]])
  })

  it('plays only higher trumps when current highest is trump and winning trumps exist', () => {
    const table = [makeCard(CardSuit.HERZ, CardRank.KÖNIG, 10)]
    const hand = [
      makeCard(CardSuit.SCHELLEN, CardRank.UNTER, 1),
      makeCard(CardSuit.HERZ, CardRank.OBER, 2),
      makeCard(CardSuit.HERZ, CardRank.ASS, 3)
    ]
    const moves = getPossibleMoves(hand, CardSuit.HERZ, table)
    expect(moves).toEqual([hand[2]])
  })

  it('plays all trumps when no winning trump', () => {
    const table = [makeCard(CardSuit.HERZ, CardRank.ASS, 10)]
    const hand = [
      makeCard(CardSuit.SCHIPPEN, CardRank.UNTER, 1),
      makeCard(CardSuit.HERZ, CardRank.OBER, 2),
      makeCard(CardSuit.HERZ, CardRank.UNTER, 3)
    ]
    const moves = getPossibleMoves(hand, CardSuit.HERZ, table)
    expect(moves).toEqual([hand[1], hand[2]])
  })

  it('plays any card when no follow-suit or trumps', () => {
    const table = [makeCard(CardSuit.HERZ, CardRank.ASS, 10)]
    const hand = [
      makeCard(CardSuit.SCHELLEN, CardRank.UNTER, 1),
      makeCard(CardSuit.SCHIPPEN, CardRank.UNTER, 2)
    ]
    const moves = getPossibleMoves(hand, CardSuit.HERZ, table)
    expect(moves).toEqual(hand)
  })

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

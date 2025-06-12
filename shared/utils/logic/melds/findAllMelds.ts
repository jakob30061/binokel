import { type Meld, MeldType } from '~/shared/types/cards'
import { detectTrumpSeven } from './combinations/diß';
import { detectBinokel } from './combinations/binokel';
import { detectFamilies } from './combinations/families';
import { detectFourAndEight } from './combinations/fourOrEightSame';
import { detectPairs } from './combinations/pairs';

export function findAllMelds(hand: Card[], trump: CardSuit): Meld[] {
  const cardsBySuitAndRank: Record<CardSuit, Record<CardRank, Card[]>> = {
    [CardSuit.EICHEL]:   { [CardRank.SIEBEN]: [], [CardRank.UNTER]: [], [CardRank.OBER]: [], [CardRank.KÖNIG]: [], [CardRank.ZEHN]: [], [CardRank.ASS]: [] },
    [CardSuit.SCHIPPEN]: { [CardRank.SIEBEN]: [], [CardRank.UNTER]: [], [CardRank.OBER]: [], [CardRank.KÖNIG]: [], [CardRank.ZEHN]: [], [CardRank.ASS]: [] },
    [CardSuit.HERZ]:     { [CardRank.SIEBEN]: [], [CardRank.UNTER]: [], [CardRank.OBER]: [], [CardRank.KÖNIG]: [], [CardRank.ZEHN]: [], [CardRank.ASS]: [] },
    [CardSuit.SCHELLEN]: { [CardRank.SIEBEN]: [], [CardRank.UNTER]: [], [CardRank.OBER]: [], [CardRank.KÖNIG]: [], [CardRank.ZEHN]: [], [CardRank.ASS]: [] },
  };

  for (const c of hand) {
    // Nur wenn type eine CardSuit ist
    if (Object.values(CardSuit).includes(c.type as CardSuit)) {
      cardsBySuitAndRank[c.type as CardSuit][c.value].push(c);
    }
  }

  const results: Meld[] = []
  detectFourAndEight(
    cardsBySuitAndRank,
    results,
    trump
  );

  const suitsWithFamily = detectFamilies(
    cardsBySuitAndRank,
    results,
    trump
  );
  detectPairs(
    cardsBySuitAndRank,
    results,
    trump,
    suitsWithFamily
  );

  detectBinokel(
    cardsBySuitAndRank,
    results,
    trump
  )

  detectTrumpSeven(
    cardsBySuitAndRank,
    results,
    trump
  )

  results.push({
    points: 0,
    cards: [],
    name: MeldType.NOTHING
  })

  return results;
}
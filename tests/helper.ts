export function makeCard(suit: CardSuit, rank: CardRank, id: number): Card {
  return { type: suit, value: rank, id, copy: {} as any } as Card
}

export function getFullHand(
  baseCards: Card[],
  trump: CardSuit,
  players: 3 | 4 = 3
): Card[] {
  const total = players === 3 ? 12 : 11
  const needed = total - baseCards.length
  if (needed <= 0) {
    return [...baseCards]
  }

  // suits excluding trump for fillers (avoid Dix)
  const suits = Object.values(CardSuit).filter((s) => s !== trump)
  let fSevens = Math.min(3, needed)
  let fTens = Math.min(3, needed - fSevens)
  let fUnters = needed - fSevens - fTens

  const fillers: Card[] = []
  let idx = 0
  // add Sevens
  for (let i = 0; i < fSevens; i++) {
    const suit = suits[idx++ % suits.length]
    fillers.push(makeCard(suit!, CardRank.SIEBEN, 1))
  }
  // add Tens
  for (let i = 0; i < fTens; i++) {
    const suit = suits[idx++ % suits.length]
    fillers.push(makeCard(suit!, CardRank.ZEHN, 1))
  }
  // add Unters
  for (let i = 0; i < fUnters; i++) {
    const suit = suits[idx++ % suits.length]
    fillers.push(makeCard(suit!, CardRank.UNTER, 1))
  }

  return [...baseCards, ...fillers]
}
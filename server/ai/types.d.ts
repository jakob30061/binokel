export type RoundState = PLAY_CARD | SELECT_TRUMP | REIZEN | MELD_POINTS

export interface PLAY_CARD {
  state: "PLAY_CARD"
  hand: Card[],
  playedCards: Card[],
  trump: CardSuit,
  table: Card[],
  playerAmount: 3 | 4
}

export interface SELECT_TRUMP {
  state: "SELECT_TRUMP"
  hand: Card[],
  playerAmount: 3 | 4
}

export interface REIZEN {
  state: "REIZEN"
  hand: Card[],
  playerAmount: 3 | 4
}

export interface MELD_POINTS {
  state: "MELD_POINTS"
  hand: Card[],
  trump: CardSuit,
  playerAmount: 3 | 4
}
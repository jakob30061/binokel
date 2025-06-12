export enum RoundState {
  WAITING_FOR_PLAYERS = "WAITING_FOR_PLAYERS",
  DEALT = "DEALT",
  REIZING = "REIZING",
  TRUMP_SELECTION = "TRUMP_SELECTION",
  MELDING = "MELDING",
  PLAYING = "PLAYING",
  FINISHED = "FINISHED",
}

export enum CardSuit {
  EICHEL = "EICHEL",
  SCHIPPEN = "SCHIPPEN",
  HERZ = "HERZ",
  SCHELLEN = "SCHELLEN",
}

export enum CardRank {
  SIEBEN = "SIEBEN",
  UNTER = "UNTER",
  OBER = "OBER",
  KÖNIG = "KÖNIG",
  ZEHN = "ZEHN",
  ASS = "ASS",
}

export enum CardDeck {
  WUERTTEMBERGISCH = "WUERTTEMBERGISCH",
  FRENCH = "FRENCH",
}

export enum CardCopy {
  A = "A",
  B = "B",
}

import { CardSuit, CardRank, CardCopy } from './generated/prisma'

export interface Card {
  value: CardRank,
  id: number,
  type: CardSuit,
  copy: CardCopy
}

export enum CARD_TYPE_CLASSIC {
  Kreuz = "Kreuz",
  Pik = "Pik",
  Herz = "Herz",
  Karo = "Karo",
}

export interface Meld {
  name: MeldType;
  cards: Card[];
  points: number;
}

export enum MeldType {
  BINOKEL = "BINOKEL",
  DOPPELTER_BINOKEL = "DOPPELTER_BINOKEL",
  VIER = "VIER",
  ACHT = "ACHT",
  FAMILIE = "FAMILIE",
  DOPPELTE_FAMILIE = "DOPPELTE_FAMILIE",
  PAAR = "PAAR",
  DIX = "DIX",
  NOTHING = "NOTHING"
}
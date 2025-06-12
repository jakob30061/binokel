import { GameError } from "~/server/websocket/errorWrapper";
import { getMeldPoints } from "../getMeldPoints";

export function detectBinokel(
  cardsBySuitAndRank: Record<CardSuit, Record<CardRank, Card[]>>,
  results: Meld[],
  trump: CardSuit
): void {
  const unterSchellen = cardsBySuitAndRank[CardSuit.SCHELLEN][CardRank.UNTER].slice();
  const oberSchippen  = cardsBySuitAndRank[CardSuit.SCHIPPEN][CardRank.OBER].slice();

  // Doppelter Binokel?
  const numDouble = Math.min(
    Math.floor(unterSchellen.length / 2),
    Math.floor(oberSchippen.length / 2)
  );
  if (numDouble >= 1) {
    // genau 2 Unter SCHELLEN + 2 Ober SCHIPPEN verwenden
    const usedUnter = unterSchellen.splice(0, 2);
    const usedOber  = oberSchippen.splice(0, 2);

    const meld: Meld = {
      name: MeldType.DOPPELTER_BINOKEL,
      cards: [...usedUnter, ...usedOber],
      points: 0,
    }
    meld.points = getMeldPoints(meld, trump)

    if(meld.points === 0)
      throw new GameError("") // TODO better error handling

    results.push(meld)
    return
  }

  // Einfacher Binokel
  const numSingle = Math.min(unterSchellen.length, oberSchippen.length);
  for (let i = 0; i < numSingle; i++) {
    const u = unterSchellen[i];
    const o = oberSchippen[i];

    if(u && o) {
      const meld: Meld = {
        name: MeldType.BINOKEL,
        cards: [u, o],
        points: 0,
      }
      meld.points = getMeldPoints(meld, trump)

      if(meld.points === 0)
        throw new GameError("") // TODO better error handling
      
      results.push(meld)
    }
  }
}
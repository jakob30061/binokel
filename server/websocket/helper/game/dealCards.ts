import { Peer } from "crossws";
import prisma from "~/server/lib/prisma";
import { GameWithPlayers } from "../../handlers/game/startGame";

/**
 * Deals cards for players
 */
export const dealCards = async (
  peer: Peer,
  game: GameWithPlayers
): Promise<[Map<string, Card[]>, Card[]]> => {
  const suits = Object.values(CardSuit)
  const ranks: CardRank[] = game.maxPlayer === 4
    ? [
        CardRank.SIEBEN,
        CardRank.UNTER,
        CardRank.OBER,
        CardRank.KÖNIG,
        CardRank.ZEHN,
        CardRank.ASS,
      ]
    : [
        CardRank.UNTER,
        CardRank.OBER,
        CardRank.KÖNIG,
        CardRank.ZEHN,
        CardRank.ASS,
      ];

  const dict = await prisma.card.findMany();
  const dictMap = new Map<string, number>();
  for (const c of dict) {
    dictMap.set(`${c.suit}:${c.rank}`, c.id);
  }

  const deck: Card[] = [];
  const copies: CardCopy[] = [CardCopy.A, CardCopy.B];
  for (const suit of suits) {
    for (const rank of ranks) {
      const dbId = dictMap.get(`${suit}:${rank}`);
      if (dbId == null) {
        throw new Error(`Missing card in dict for ${suit}:${rank}`);
      }
      for (const copy of copies) {
        deck.push({ id: dbId, value: rank, type: suit, copy });
      }
    }
  }

  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  // 4) deal
  const handSize = game.maxPlayer === 3 ? 12 : 9;
  const hands = new Map<string, Card[]>();
  for (const p of game.players) hands.set(p.uuid, deck.splice(0, handSize));

  return [hands, deck]
}
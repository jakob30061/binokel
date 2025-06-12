import prisma from '~/server/lib/prisma';
import { CardsSchema } from '../../../../shared/types/zod/actions/gameState'

export async function getCards(
  game: any,
  playerUUID: string
): Promise<CardsSchema> {
  const {
    rule: { deck: blatt },
    activeRound: { id: roundId, state },
  } = game;

  const [dealt, turns] = await Promise.all([
    prisma.binokelCardOwnedByPlayer.findMany({
      where: { roundId },
      select: {
        playerUuid: true,
        id:         true,
        copy:       true,
        card: {
          select: {
            rank: true,
            suit: true,
          },
        },
      },
    }),
    prisma.binokelTurn.findMany({
      where:   { roundId },
      orderBy: { turnNumber: 'desc' },
      include: {
        playedCards: {
          select: {
            id:   true,
            copy: true,
            card: {
              select: {
                rank: true,
                suit: true,
              },
            },
          },
        },
      },
    }),
  ]);

  // group cards by player
  const byPlayer = new Map<
    string,
    { id: number; rank: CardRank; suit: CardSuit, copy: CardCopy }[]
  >();
  for (const row of dealt) {
    const arr = byPlayer.get(row.playerUuid) || [];
    arr.push({
      id: row.id,
      rank: row.card.rank as CardRank,
      suit: row.card.suit as CardSuit,
      copy: row.copy as CardCopy
    });
    byPlayer.set(row.playerUuid, arr);
  }

  const playedCardIds = new Set<number>();
  for (const turn of turns) {
    for (const pc of turn.playedCards) {
      playedCardIds.add(pc.id);
    }
  }

  const ownCards =
  byPlayer.get(playerUUID)
    ?.filter(c => !playedCardIds.has(c.id))
    .map(c => ({
      id:    c.id,
      value: c.rank,
      type:  c.suit,
      copy:  c.copy,
    })) || [];

  const opponents = Array.from(byPlayer.entries())
  .filter(([uuid]) => uuid !== playerUUID)
  .map(([uuid, cards]) => {
    const remaining = cards.filter(c => !playedCardIds.has(c.id)).length;
    return {
      position: uuid,
      cards:    remaining,
    };
  });

  const table: Card[] = turns.at(0)?.playedCards.map((pc) => ({
    id:    pc.id,
    value: pc.card.rank as CardRank,
    type:  pc.card.suit as CardSuit,
    copy:  pc.copy as CardCopy,
  })) ?? [];

  return {
    cards: {
      blatt,
      own: ownCards,
      opponents,
      table
    }
  };
}
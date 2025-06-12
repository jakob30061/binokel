import { GameError } from "~/server/websocket/errorWrapper";
import { type GlobalData } from "../gatherGlobalData";
import { ResPlaySchema } from "../../../../../shared/types/zod/actions/gameState";
import prisma from "~/server/lib/prisma";
import { getCards } from "../getCards";
import { getNextPlayer } from "../../player";
import { getTrickWinner } from "~/shared/utils";

export async function getPlayStateForPlayer(
  playerUUID: string,
  globalData: GlobalData
): Promise<ResPlaySchema> {
  const round = await prisma.binokelRound.findFirst({
    where: { id: globalData.activeRound.id },
    include: {
      melds: {
        orderBy: { createdAt: 'asc' },
        select: { userUuid: true, points: true }
      },
      game: {
        select: { players: { select: { uuid: true } } }
      },
      turns: {
        orderBy: { turnNumber: 'desc' },
        include: {
          playedCards: {
            orderBy: { playedAt: 'asc' },
            include: {
              card:   { select: { rank: true, suit: true } },
              player: { select: { uuid: true } },
            }
          }
        }
      }
    }
  })

  if(!round)
    throw new GameError("")

  if(!round.reizValue || !round.reizWinnerUuid || !round.trump)
    throw new GameError("")

  
  const playerUUIDs = round.game.players.map(p => p.uuid)
  const latestTurn = round.turns[0]
  const playedCards = latestTurn?.playedCards || []

  if(round.turns.length === 0) {
    round.turns.push(
      await prisma.binokelTurn.create({
        data: {
          turnNumber: 1,
          roundId: round.id
        },
        include: {
          playedCards: {
            orderBy: { playedAt: 'asc' },
            include: {
              card:   { select: { rank: true, suit: true } },
              player: { select: { uuid: true } },
            }
          }
        }
      })
    )
  }

  let nextPlayerUUID: string
  if (playedCards.length === 0) {
    // New trick
    if (round.turns.length === 1) {
      // very first trick → dealer leads
      nextPlayerUUID = getNextPlayer(
        round.dealerUuid!,
        playerUUIDs
      )
    } else {
      // not the first trick → winner of the *previous* trick leads
      const previousPlayed = round.turns[1].playedCards
      const tableCards: Record<string, Card> = previousPlayed.reduce(
        (acc, { playerUuid, id, card, copy }) => {
          acc[playerUuid] = {
            id,
            value: card.rank as CardRank,
            type:  card.suit as CardSuit,
            copy:  copy as CardCopy,
          }
          return acc
        },
        {} as Record<string, Card>
      )

      nextPlayerUUID = await getTrickWinner(
        tableCards,
        round.trump as CardSuit
      )
    }
  }
  else if (playedCards.length < playerUUIDs.length) {
    // Mid‐trick: next seat after the last play
    const lastPlayer    = playedCards.at(-1)!.player.uuid
    nextPlayerUUID     = getNextPlayer(
      lastPlayer,
      playerUUIDs
    )
  }
  else {
    // Trick complete: winner of this trick leads
    const tableCards: Record<string, Card> = playedCards.reduce(
      (acc, { playerUuid, id, card, copy }) => {
        acc[playerUuid] = {
          id,
          value: card.rank as CardRank,
          type:  card.suit as CardSuit,
          copy:  copy as CardCopy,
        }
        return acc
      },
      {} as Record<string, Card>
    )

    nextPlayerUUID = await getTrickWinner(
      tableCards,
      round.trump as CardSuit
    )
  }

  const melded = round.melds.map(e => ({
    playerUUID: e.userUuid,
    points:     e.points
  }));

  const cards = await getCards(globalData, playerUUID)
  const trumpSuit = round.trump as CardSuit

  const turns = playedCards.map(pc => ({
    id:    pc.id,
    value: pc.card.rank as CardRank,
    type:  pc.card.suit as CardSuit,
    copy:  pc.copy as CardCopy,
  }))

  return {
    isMyPlayTurn: nextPlayerUUID === playerUUID,
    turns,
    melded,
    trump: trumpSuit,
    reizen: {
      reizValue: round.reizValue!,
      reizWinner: round.reizWinnerUuid!,
    },
    ...cards,
  }
}
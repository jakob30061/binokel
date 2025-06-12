import type { Peer } from 'crossws';
import prisma from '~/server/lib/prisma';
import { GameError } from '~/server/websocket/errorWrapper';
import channels from '~/server/websocket/helper/channels';
import { getNextPlayer } from '~/server/websocket/helper/player';
import { type NotifyPlayers, notifyPlayers } from '~/server/websocket/notifyHandler';
import { ReqPlayCardData, ResCardPlayed, ResCardPlayedAccepted } from '~/shared/types';
import { getTrickWinner } from '~/shared/utils';

export const handlePlayCard = async (peer: Peer, gameEvent: any) => {
  const body = ReqPlayCardData.parse(gameEvent);

  const round = await prisma.binokelRound.findFirst({
    where: { 
      game: { pin: body.data.gamePin },
      activeInGame: { isNot: null }
    },
    include: {
      game: {
        select: {
          uuid: true,
          players: { select: { uuid: true } }
        }
      },
      turns: {
        orderBy: { turnNumber: 'desc' },
        include: {
          playedCards: {
            orderBy: { playedAt: 'asc' },
            include: { 
              player: { select: { uuid: true } },
              card: { select: { suit: true, rank: true } }
            }
          }
        }
      },
      cards: {
        where: { playerUuid: body.data.playerUUID },
        include: {
          card: { select: { rank: true, suit: true } }
        }
      }
    }
  })

  if (!round) throw new GameError('Active round not found')

  const playerUUIDs = round.game.players.map(p => p.uuid)
  const latestTurn = round.turns[0]
  const playedCards = latestTurn?.playedCards || []

  let expectedPlayer: string
  if (playedCards.length === 0) {
    // New trick
    if (round.turns.length === 1) {
      // very first trick → dealer leads
      expectedPlayer = getNextPlayer(
        round.dealerUuid!,
        playerUUIDs
      )
    } else {
      // not the first trick → winner of the *previous* trick leads
      const previousPlayed = round.turns[1]!.playedCards
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

      expectedPlayer = await getTrickWinner(
        tableCards,
        round.trump as CardSuit
      )
    }
  }
  else if (playedCards.length < playerUUIDs.length) {
    // Mid‐trick: next seat after the last play
    const lastPlayer   = playedCards.at(-1)!.player.uuid
    console.log(lastPlayer);
    
    expectedPlayer     = getNextPlayer(
      lastPlayer,
      playerUUIDs
    )
    console.log(expectedPlayer, body.data.playerUUID);
    
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

    expectedPlayer = await getTrickWinner(
      tableCards,
      round.trump as CardSuit
    )
  }

  if (body.data.playerUUID !== expectedPlayer) {
    throw new GameError("It's not your turn to play a card")
  }

  const playedCount = latestTurn?.playedCards.length ?? 0
  const desiredTurnNumber = 
    !latestTurn || playedCount >= playerUUIDs.length
      ? (latestTurn ? latestTurn.turnNumber + 1 : 1)
      : latestTurn.turnNumber

  // check card if valid
  /* if(isValidMove(
    body.data.card,
    hand,
    round.trump,
    table
  )) */

  const turnRecord = await prisma.$transaction(async (tx) => {
    const turn = await tx.binokelTurn.upsert({
      where: {
        roundId_turnNumber: {
          roundId:    round.id,
          turnNumber: desiredTurnNumber,
        }
      },
      create: {
        roundId: round.id,
        turnNumber: desiredTurnNumber,
      },
      update: {},
      select: { id: true }
    })

    await tx.binokelCardOwnedByPlayer.update({
      where: {
        id: body.data.card.id,
      },
      data: {
        turnId:   turn.id,
        playedAt: new Date()
      }
    })

    return await tx.binokelTurn.findUnique({
      where: { id: turn.id },
      select: {
        id:         true,
        turnNumber: true,
        playedCards: {
          orderBy: { playedAt: 'asc' },
          select: {
            id:         true,
            playerUuid: true,
            copy:       true,
            playedAt:   true,
            card: { select: { rank: true, suit: true } }
          }
        }
      }
    })
  })


  // TODO check

  notifyPlayers(
    peer,
    {
      notifyPeer: true,
      data: JSON.stringify({
        success: true,
        action: WebsocketTypes.PLAYED_CARD_ACCEPTED,
        data: {
          card: body.data.card
        }
      } satisfies ResCardPlayedAccepted)
    }
  )

  if(!turnRecord)
    throw new GameError("")

  const playedCountFinal = turnRecord?.playedCards.length

  let nextPlayerUUID: string | null = null
  if (playedCountFinal < playerUUIDs.length) {
    // still cards left in this trick → next goes
    nextPlayerUUID = getNextPlayer(
      body.data.playerUUID,   // who just played
      playerUUIDs
    )
  } else {
    const tableCards: Record<string, Card> = turnRecord.playedCards.reduce(
      (acc, { playerUuid, id, card, copy }) => {
        acc[playerUuid] = {
          id,
          value: card.rank as CardRank,
          type:  card.suit as CardSuit,
          copy: copy as CardCopy,
        }
        return acc
      },
      {} as Record<string, Card>
    )
    // next player is stich winner
    const winnerUUID = getTrickWinner(
      tableCards,
      round.trump as CardSuit // TODO not good type
    )

    await prisma.$transaction(async (tx) => {
      await tx.binokelTurn.update({
        where: {
          roundId_turnNumber: {
            roundId:    round.id,
            turnNumber: desiredTurnNumber,
          }
        },
        data: {
          trickWinnerUuid: winnerUUID,
          pointsWon: 50
        }
      })

      await tx.binokelTurn.create({
        data: {
          roundId: round.id,
          turnNumber: turnRecord.turnNumber + 1
        }
      })
    })

    setTimeout(() => {
      const payload: NotifyPlayers[] = []
      playerUUIDs.forEach(pUUID => {
        payload.push({
          channel: pUUID !== body.data.playerUUID
            ? channels.getUserChannel(pUUID)
            : undefined,
          notifyPeer: body.data.playerUUID === pUUID,
          data: JSON.stringify({
            success: true,
            action: WebsocketTypes.PLAY_CARD,
            data: {
              isMyPlayTurn: winnerUUID === pUUID,
              table: []
            }
          } satisfies ResCardPlayed)
        })
      });

      notifyPlayers(peer, payload)
    }, 1500)
  }

  const table: Card[] = turnRecord.playedCards.map(p => ({
    copy: p.copy as CardCopy,
    id: p.id,
    type: p.card.suit as CardSuit,
    value: p.card.rank as CardRank
  }))

  const payload: NotifyPlayers[] = []
  playerUUIDs.forEach(pUUID => {
    payload.push({
      channel: pUUID !== body.data.playerUUID
        ? channels.getUserChannel(pUUID)
        : undefined,
      notifyPeer: body.data.playerUUID === pUUID,
      data: JSON.stringify({
        success: true,
        action: WebsocketTypes.PLAY_CARD,
        data: {
          isMyPlayTurn: nextPlayerUUID === pUUID,
          table: table
        }
      } satisfies ResCardPlayed)
    })
  });

  notifyPlayers(peer, payload)
}
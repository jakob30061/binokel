import type { Peer } from 'crossws';
import prisma from '~/server/lib/prisma';
import { GameError } from '~/server/websocket/errorWrapper';
import { getNextPlayer } from '~/server/websocket/helper/player';
import { notifyPlayers } from '~/server/websocket/notifyHandler';
import { roundStateTransition } from '~/server/websocket/helper/stateTransition';
import channels from '~/server/websocket/helper/channels';
import { ReqMakeMeldData, ResMeldData } from '~/shared/types';

export const meldPoints = async (peer: Peer, gameEvent: any) => {
  const body = ReqMakeMeldData.parse(gameEvent);

  // check if its players turn to meld
  const game = await prisma.binokelGame.findFirst({
    where: { pin: body.data.gamePin },
    select: {
      uuid: true,
      players: true,
      activeRound: { select: {
        id: true,
        reizWinnerUuid: true,
        state: true,
        melds: {
          orderBy: { createdAt: 'asc' },
        }
      }}
    }
  })

  // no melds yet. Reizwinner starts
  if(
    game?.activeRound?.melds.length === 0
    && body.data.playerUUID !== game.activeRound.reizWinnerUuid
  )
    throw new GameError("") // TODO better error

  if(!game)
    throw new GameError("")

  const playerUUIDs = game.players.map((p) => p.uuid)
  let nextPlayerUUID: string | null = getNextPlayer(body.data.playerUUID, playerUUIDs)

  if(
    game?.activeRound?.melds.length // we have melds already
  ) {
    const lastMeld = game.activeRound.melds.at(-1)
    const testPlayerUUID = getNextPlayer(lastMeld!.userUuid, playerUUIDs)

    if(testPlayerUUID !== body.data.playerUUID)
      throw new GameError("") // TODO better error
  }

  // check if meld is valid
  const lastMeld = await prisma.$transaction(async (tx) => {
    const submittedIds = body.data.melds.flatMap(meld =>
      meld.cards.map(card => card.id)
    );

    const validCount = await tx.binokelCardOwnedByPlayer.count({
      where: {
        playerUuid: body.data.playerUUID,
        roundId:    game!.activeRound!.id,
        id:         { in: submittedIds }
      }
    });

    if (validCount !== submittedIds.length) {
      throw new Error('Invalid card play: some cards are not owned by you');
    }

    const lastMeld = await tx.binokelMeld.create({
      data: {
        points: body.data.totalPoints,
        roundId: game?.activeRound?.id!,
        userUuid: body.data.playerUUID,
        cards: {
          connect: submittedIds.map(id => ({ id })),
        },
      }
    })

    return lastMeld
  })

  // check if next player has already melded
  if (game?.activeRound?.melds.some(m => m.userUuid === nextPlayerUUID)) {
    return await roundStateTransition(
      peer,
      game.activeRound.id,
      game.activeRound.state,  // RoundState.MELDING
      body.data.playerUUID
    )
  }

  // else notify players about meld and
  // notify next meld player
  notifyPlayers(
    peer,
    {
      channel: channels.getGameChannel(game?.uuid!), // TODO not safe
      notifyPeer: true,
      data: JSON.stringify({
        success: true,
        action: WebsocketTypes.MakeMeld,
        data: {
          isMyTurnToMeld: nextPlayerUUID! // TODO not safe
        }
      } satisfies ResMeldData)
    }
  )
}
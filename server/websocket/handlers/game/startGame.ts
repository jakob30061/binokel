import type { Peer } from 'crossws';
import { notifyPlayers } from '~/server/websocket/notifyHandler';
import prisma from '~/server/lib/prisma';
import { getGameStateForPlayers } from '~/server/websocket/helper/game_state';
import channels from '~/server/websocket/helper/channels';
import type { NotifyPlayers } from '~/server/websocket/notifyHandler';
import { GameError } from '~/server/websocket/errorWrapper';
import { ResReizen } from '../../../../shared/types/zod/actions/reizen';

import pkg from '@prisma/client'
import type { Prisma } from '@prisma/client'
import { dealCards } from '../../helper/game/dealCards';

const gameWithPlayers = pkg.Prisma.validator<Prisma.BinokelGameSelect>()({
  uuid: true,
  maxPlayer: true,
  players: {
    select: { uuid: true },
  },
  rule: true
});
export type GameWithPlayers = Prisma.BinokelGameGetPayload<{
  select: typeof gameWithPlayers;
}>;

/**
 * Starts the game and deals card to players
 * 
 * @param peer 
 * @param game 
 * @param userUUID 
 * @returns 
 */
export const startGameIfFull = async (peer: Peer, game: GameWithPlayers, userUUID: string) => {
  // check if max player reached (all joined)
  if(game.maxPlayer !== game.players.length) return

  const [hands, deck] = await dealCards(peer, game)

  const updatedGame = await prisma.$transaction(async (tx) => {
    const randomIndex = Math.floor(Math.random() * game.players.length);
    const dealerUuid = game.players[randomIndex].uuid;

    const updatedGame = await tx.binokelGame.update({
      where: { uuid: game.uuid },
      data: {
        activeRound: { update: { 
          state: RoundState.REIZING,
          dealerUuid,
          reizActions: {
            create: { // dealer starts with 200
              bidValue: CONFIG.START_REIZ_VALUE,
              playerUuid: dealerUuid,
            }
          }
        } },
      },
      select: {
        activeRound: { select: { id: true, dealerUuid: true, state: true } },
      },
    });

    const roundId = updatedGame.activeRound?.id;
    if (!roundId)
      throw new GameError(
        'Active round not found — cannot deal cards; rolling back'
      );

    const createRows: Prisma.BinokelCardOwnedByPlayerCreateManyInput[] = [];
    for (const p of game.players) {
      for (const card of hands.get(p.uuid)!) {
        createRows.push({
          copy: card.copy,
          cardId: card.id,
          roundId,
          playerUuid: p.uuid,
        });
      }
    }
    await tx.binokelCardOwnedByPlayer.createMany({
      data: createRows
    });

    return updatedGame;
  });

  const payload: NotifyPlayers[] = [];
  for (const p of game.players) {
    const gs = await getGameStateForPlayers(p.uuid, game.uuid);
    if (!gs) continue;

    payload.push({
      channel: channels.getUserChannel(p.uuid),
      notifyPeer: userUUID === p.uuid,
      data: JSON.stringify(gs),
    });
  }

  notifyPlayers(peer, payload)

  if (!(updatedGame.activeRound && updatedGame.activeRound.dealerUuid))
    throw new GameError(
      'Active round not found — cannot deal cards; rolling back'
    );

  // start reizen
  notifyPlayers(peer, {
    channel: channels.getUserChannel(updatedGame.activeRound?.dealerUuid),
    notifyPeer: userUUID === updatedGame.activeRound?.dealerUuid,
    data: JSON.stringify({
      success: true,
      action: WebsocketTypes.Reizen,
      data: {
        playerUUID: userUUID,
        amount: CONFIG.START_REIZ_VALUE
      }
    } satisfies ResReizen)
  })
}

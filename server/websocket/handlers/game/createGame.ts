import type { Peer } from 'crossws';
import prisma from '~/server/lib/prisma';
import { errorHandling } from '~/server/websocket/errorWrapper';
import channels from '~/server/websocket/helper/channels';
import { invokeAi } from '~/server/ai';
import { ReqCreateGameData, ResCreateGame } from '~/shared/types';
import { joinGame } from '../sessions/joinGame';

export const handleCreateGame = errorHandling(async (peer: Peer, gameEvent: any) => {
  const body = ReqCreateGameData.parse(gameEvent);
  const gamePin = Math.floor(10000 + Math.random() * 90000).toString();

  const game = await prisma.$transaction(async (tx) => {
    const game = await tx.binokelGame.create({
      data: {
        maxPlayer: body.data.maxPlayer,
        pin:       gamePin,
        password:  body.data.password ?? null,

        rule: {
          create: {
            name:   'Custom',
            global: false,
            rounds: body.data.rules?.rounds,
            deck:   body.data.rules.deckTheme,
          }
        },

        rounds: {
          create: {
            roundNumber: 1
          }
        }
      },
      include: {
        rounds: {
          take: 1,
          orderBy: { roundNumber: 'asc' }
        }
      }
    });

    const firstRoundId = game.rounds[0].id;

    const updated = await tx.binokelGame.update({
      where: { uuid: game.uuid },
      data:  { activeRoundId: firstRoundId },
      include: {
        activeRound: {
          select: { id: true, roundNumber: true, state: true }
        }
      }
    });

    return updated;
  });


  const id = channels.getGameChannel(game.uuid)

  // this is always a user. ai can't create games
  peer.send({
    success: true,
    action: WebsocketTypes.CreateGame,
    data: { game }
  } satisfies ResCreateGame);
  peer.subscribe(id);

  // bootstrap ai
  for (let index = 0; index < body.data.aiPlayer; index++) {
    const ai = await invokeAi(
      game.uuid
    )
  }

  // ai already joined
  joinGame(peer, { gamePin, playerUUID: body.data.playerUUID })
});

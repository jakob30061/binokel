import prisma from "~/server/lib/prisma";
import type { Peer } from 'crossws';
import channels from "~/server/websocket/helper/channels";
import { getGameStateForPlayers } from "~/server/websocket/helper/game_state";
import { errorHandling, GameError } from "../../errorWrapper";
import { ReqPlayerIsInGame, ResPlayerIsInGame } from "~/shared/types";
import { startGameIfFull } from "../game/startGame";

export const handlePlayerIsInGame = errorHandling(async (peer: Peer, gameEvent: any) => {
  const body = ReqPlayerIsInGame.parse(gameEvent);
  
  if (body.data.gamePin.length !== CONFIG.GAME_PIN_LENGTH)
    throw new GameError("Invalid params");

  const game = await prisma.binokelGame.findFirstOrThrow({
    where: { pin: body.data.gamePin },
    select: {
      uuid:      true,
      maxPlayer: true,
      rule:      true,
      players:    { select: { uuid: true } },

      activeRound: {
        select: {
          roundNumber: true,
          state:       true
        }
      }
    }
  });

  const isMember = game.players.some(p => p.uuid === body.data.playerUUID);

  if (!isMember) {
    throw new GameError("No member in game", WebsocketTypes.JoinGame)
  }

  peer.send({
    success: true,
    action: WebsocketTypes.PlayerIsInGame,
    data: {
      allowed: isMember,
      playerCount: game.players.length,
      maxPlayers: game.maxPlayer
    }
  } satisfies ResPlayerIsInGame);

  // subscribe to channels
  peer.subscribe(channels.getGameChannel(game.uuid))
  peer.subscribe(channels.getUserChannel(body.data.playerUUID))

  if(game.activeRound?.state === RoundState.WAITING_FOR_PLAYERS)
    startGameIfFull(peer, game, body.data.playerUUID);
  else {
    peer.send(await getGameStateForPlayers(body.data.playerUUID, game.uuid))
  }
});
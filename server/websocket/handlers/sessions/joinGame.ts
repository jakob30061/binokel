import prisma from "~/server/lib/prisma";
import type { Peer } from 'crossws';
import { errorHandling, GameError } from "~/server/websocket/errorWrapper";
import channels from "~/server/websocket/helper/channels";
import { notifyPlayers } from "~/server/websocket/notifyHandler";
import { ReqJoinGameData, ResJoinGame, ResNewPlayerJoined } from "~/shared/types";
import { startGameIfFull } from "../game/startGame";

export const handleJoinGame = errorHandling(async (peer: Peer, gameEvent: any) => {
  const body = ReqJoinGameData.parse(gameEvent);
  if (body.data.gamePin.length !== CONFIG.GAME_PIN_LENGTH) return;

  const [row] = await prisma.$queryRaw<{ password: string | null }[]>`
  SELECT password FROM BinokelGame WHERE pin = ${body.data.gamePin} LIMIT 1`;

  try {
    const game = await prisma.binokelGame.findFirstOrThrow({
      where: { pin: body.data.gamePin },
      select: {
        uuid: true,
        pin: true,
        maxPlayer: true
      }
    });

    const passwordProtected = !!row.password;

    if(passwordProtected) {
      peer.send({
        success: true,
        action: WebsocketTypes.JoinGame,
        data: { gamePin: game.pin, passwordProtected }
      } satisfies ResJoinGame);
      return;
    }

    joinGame(peer, {
      gamePin: body.data.gamePin,
      playerUUID: body.data.playerUUID
    });
  } catch (error) {
    throw new GameError(WebsocketErrors.NoValidGamePin, body.action)
  }
});

export const joinGame = errorHandling(async (peer: Peer, data: { gamePin: string, playerUUID: string }) => {
  const game = await prisma.$transaction(
    async (tx) => {
      const g = await tx.binokelGame.findUnique({
        where: { pin: data.gamePin },
        select: {
          uuid        : true,
          pin         : true,
          maxPlayer : true,
          players : { select: { uuid: true } },
        }
      });

      if (!g) return new GameError("Game not found");
      if (g.players.some(p => p.uuid === data.playerUUID))
        return new GameError("You're already in this game");
      if (g.players.length >= g.maxPlayer)
        return new GameError("The table is already full");
      
      // TODO fix
/*       if (g.players.some(p => p.uuid === data.playerUUID && p.activeGameId !== g.uuid)) {
        return new GameError("You are in active Game already");
      } */

      const updated = await tx.binokelGame.update({
        where: { uuid: g.uuid },
        data : {
          players: { connect: { uuid: data.playerUUID } },
        },
        select: {
          uuid   : true,
          pin    : true,
          rule: true,
          maxPlayer: true,
          players: { select: { uuid: true } },
        },
      });

      return updated;
    },
    { isolationLevel: "Serializable" }
  );

  if (game instanceof GameError)
    throw game;

  peer.send({
    success: true,
    action: WebsocketTypes.JoinGame,
    data: { gamePin: game.pin }
  } satisfies ResJoinGame );

  const id = channels.getGameChannel(game.uuid)
  peer.subscribe(id)
  peer.subscribe(channels.getUserChannel(data.playerUUID))
  
  // notifyPeersNewPlayerJoined
  notifyPlayers(
    peer,
    {
      channel: id,
      notifyPeer: true,
      data: JSON.stringify({
        success: true,
        action: WebsocketTypes.NEW_PLAYER_JOINED,
        data: {
          playerCount: game.maxPlayer,
          currentPlayerCount: game.players.length
        }
      } satisfies ResNewPlayerJoined)
    }
  )
  
  startGameIfFull(peer, game, data.playerUUID);
})

import { Peer } from "crossws";
import { errorHandling, GameError } from "~/server/websocket/errorWrapper";
import prisma from "~/server/lib/prisma";
import { type NotifyPlayers, notifyPlayers } from "~/server/websocket/notifyHandler";
import channels from "~/server/websocket/helper/channels";
import { getGameStateForPlayers } from "~/server/websocket/helper/game_state";
import { getNextReizPlayerUUID } from "./getNextReizPlayer";
import { finishReizen } from "./finishReizen";
import { ReqReizenData, ResReizen } from "~/shared/types";

export const setReizValue = errorHandling(async (peer: Peer, gameEvent: any) => {
  const body = ReqReizenData.parse(gameEvent);

   // TODO check if player is at turn

  const game = await prisma.binokelGame.findFirst({
    where: {
      pin: body.data.gamePin,
    },
    select: {
      players: { select: { uuid: true } },
      activeRoundId: true,
      uuid: true
    }
  })

  if(!game?.activeRoundId)
    throw new GameError(WebsocketErrors.InternalServerError, WebsocketTypes.Reizen)

  const reizEntry = await prisma.binokelReizAction.create({
    data: {
      bidValue: body.data.amount,
      playerUuid: body.data.playerUUID,
      passed: body.data.pass,
      roundId: game?.activeRoundId
    }
  })

  type ss = { passed: true } | { amount: number };
  const a: ss  = reizEntry.passed 
    ? { passed: true }
    : { amount: reizEntry.bidValue! } // TODO better type

  const nextPlayerUUID = await getNextReizPlayerUUID(game?.activeRoundId, body.data.playerUUID)
  console.log("Next Reiz " + nextPlayerUUID);
  
  // reizen finished
  if(nextPlayerUUID === "finished")
    return await finishReizen(peer, game.activeRoundId, body.data.playerUUID)

  if(!nextPlayerUUID)
    return
    
  const gameStateForNextPlayer = await getGameStateForPlayers(nextPlayerUUID, game.uuid)
  const payload: NotifyPlayers[] = [
    {
      channel: channels.getGameChannel(game.uuid),
      notifyPeer: true,
      data: JSON.stringify({
        success: true,
        action: WebsocketTypes.Reizen,
        data: {
          playerUUID: reizEntry.playerUuid, // TODO fix
          ...a
        }
      } satisfies ResReizen)
    },
    {
      channel: channels.getUserChannel(nextPlayerUUID),
      data: JSON.stringify(gameStateForNextPlayer)
    },
  ]

  // notify players about new reiz value
  notifyPlayers(
    peer,
    payload
  )
});
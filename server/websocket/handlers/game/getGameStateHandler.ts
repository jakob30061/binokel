import { Peer } from "crossws";
import { errorHandling, GameError } from "~/server/websocket/errorWrapper";
import { notifyPlayers } from "../../notifyHandler";
import { getGameStateForPlayers } from "../../helper/game_state";
import prisma from "~/server/lib/prisma";
import { ResRoundState } from "~/shared/types";

export const getGameState = errorHandling(async (peer: Peer, gameEvent: any) => {
  const body = GameStateData.parse(gameEvent);
  
  const game = await prisma.binokelGame.findUnique({
    where: { pin: body.data.gamePin },
    select: { uuid: true }
  })

  if(!game)
    throw new GameError(WebsocketErrors.NoValidGamePin)

  const gs = await getGameStateForPlayers(
    body.data.playerUUID,
    game?.uuid
  )

  if(!gs)
    throw new GameError(
      WebsocketErrors.InternalServerError,
      body.action as WebsocketTypes
    )

  // notify players
  notifyPlayers(
    peer,
    {
      notifyPeer: true,
      data: JSON.stringify(gs satisfies ResRoundState)
    }
  )
});
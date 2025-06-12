import { Peer } from "crossws";
import prisma from "~/server/lib/prisma";
import { errorHandling } from "~/server/websocket/errorWrapper";
import { notifyPlayers } from "~/server/websocket/notifyHandler";
import channels from "~/server/websocket/helper/channels";
import { roundStateTransition } from "~/server/websocket/helper/stateTransition";
import { ReqSetTrumpData, ResTrumpData } from "~/shared/types";

export const setTrump = errorHandling(async (peer: Peer, gameEvent: any) => {
  const body = ReqSetTrumpData.parse(gameEvent);

  // TODO check if player can decide trump

  const game = await prisma.binokelGame.update({
    where: {
      pin: body.data.gamePin,
    },
    data: {
      activeRound: {
        update: {
          trump: body.data.trump as CardSuit, // TODO Fix type
        },
      },
    },
    select: {
      activeRound: {
        select: {
          id: true,
          trump: true,
          state: true,
        },
      },
      uuid: true
    },
  })

  if(!(game && game.activeRound))
    return // TODO better


  // notify players about trump color
  notifyPlayers(peer, [{
    channel: channels.getGameChannel(game.uuid),
    notifyPeer: true,
    data: JSON.stringify({
      success: true,
      action: WebsocketTypes.SetTrump,
      data: {
        trump: body.data.trump
      },
    } satisfies ResTrumpData)
  }])

  await roundStateTransition(
    peer,
    game.activeRound.id,
    game.activeRound.state, // RoundState.TRUMP_SELECTION
    body.data.playerUUID
  )
});
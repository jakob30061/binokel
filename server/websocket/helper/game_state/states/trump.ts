import prisma from "~/server/lib/prisma";
import { GlobalData } from "../gatherGlobalData";
import { getCards } from "../getCards";
import { ResTrumpSchema } from "../../../../../shared/types/zod/actions/gameState";
import { GameError } from "~/server/websocket/errorWrapper";

export async function getTrumpStateForPlayer(
  playerUUID: string,
  globalData: GlobalData
): Promise<ResTrumpSchema> {
  const round = await prisma.binokelRound.findFirst({
    where: { id: globalData.activeRound.id }
  })

  if(!round)
    throw new GameError("")

  if(!round.reizValue || !round.reizWinnerUuid)
    throw new GameError("")

  return {
    iCanSelectTrump: round.reizWinnerUuid === playerUUID,
    reizen: {
      reizValue: round.reizValue,
      reizWinner: round.reizWinnerUuid // TODO dont publish uuid
    },
    ...await getCards(globalData, playerUUID)
  }
}
import prisma from "~/server/lib/prisma";
import { GlobalData } from "../gatherGlobalData";
import { ResReizenSchema } from "../../../../../shared/types/zod/actions/gameState";
import { getNextReizPlayerUUID } from "~/server/websocket/handlers/game/reizen/getNextReizPlayer";
import { getCards } from "../getCards";

export async function getReizenStateForPlayer(
  playerUUID: string,
  globalData: GlobalData
): Promise<ResReizenSchema> {

  const lastBid = await prisma.binokelReizAction.findFirst({
    where: {
      roundId: globalData.activeRound.id,
      bidValue: { not: null }
    },
    orderBy: { createdAt: "desc" },
    select: { bidValue: true }
  });

  const currentValue = lastBid?.bidValue ?? CONFIG.START_REIZ_VALUE;
  const nextPlayer = await getNextReizPlayerUUID(
    globalData.activeRound.id,
    globalData.activeRound.dealerUuid! // TODO FIX
  )

  return {
    isMyReizTurn: nextPlayer === playerUUID,
    currentValue: currentValue,
    ...await getCards(globalData, playerUUID)
  }
}
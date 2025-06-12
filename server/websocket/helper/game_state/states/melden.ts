import { GlobalData } from "../gatherGlobalData";
import { ResMeldedSchema } from "../../../../../shared/types/zod/actions/gameState";
import prisma from "~/server/lib/prisma";
import { getCards } from "../getCards";
import { GameError } from "~/server/websocket/errorWrapper";
import { getNextPlayer } from "../../player";

export async function getMeldenStateForPlayer(
  playerUUID: string,
  globalData: GlobalData
): Promise<ResMeldedSchema> {
  const round = await prisma.binokelRound.findFirst({
    where: { id: globalData.activeRound.id },
    include: {
      melds: {
        orderBy: { createdAt: 'asc' },
        select: { userUuid: true }
      },
      game: {
        select: { players: { select: { uuid: true } } }
      }
    }
  })

  if(!round)
    throw new GameError("")

  if(!round.reizValue || !round.reizWinnerUuid || !round.trump)
    throw new GameError("")

  
  const playerUUIDs = round.game.players.map(p => p.uuid)

  async function amIMeldTurn(): Promise<boolean> {
    const { melds, reizWinnerUuid } = round! // TODO not good

    const uniqueMelders = new Set(melds.map(m => m.userUuid)).size
    if (uniqueMelders >= playerUUIDs.length) {
      return false
    }

    if (melds.length === 0) {
      return playerUUID === reizWinnerUuid
    }

    const lastUuid = melds.at(-1)!.userUuid! // TODO not good
    const nextUuid = getNextPlayer(lastUuid, playerUUIDs)
    return playerUUID === nextUuid
  }

  const isMyMeldTurn = await amIMeldTurn()

  const cards = await getCards(globalData, playerUUID)
  const trumpSuit = round.trump as CardSuit // TODO fix type

  // shared Payload
  const shared = {
    trump: trumpSuit,
    reizen: {
      reizValue: round.reizValue!,
      reizWinner: round.reizWinnerUuid!,
    },
    ...cards,
  };

  return {
    isMyMeldTurn,
    //possibleMelds: await findAllMelds(cards.cards.own, trumpSuit),
    ...shared,
  }
}
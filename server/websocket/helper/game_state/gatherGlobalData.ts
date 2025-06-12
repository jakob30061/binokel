import prisma from "~/server/lib/prisma";
import { GameError } from "../../errorWrapper";

export interface GlobalData {
  activeRound: {
    id: number;
    state: RoundState;
    dealerUuid: string | null;
  }
}

export async function gatherGlobalData(
  gameUUID: string,
  minimal?: boolean
): Promise<GlobalData | GameError> {
  
  const game = await prisma.binokelGame.findUnique({
    where: { uuid: gameUUID },
    select: {
      maxPlayer: true,
      rule: { select: { deck: true } },
      activeRound: { select: {
        id: true,
        state: true,
        reizValue: true,
        reizWinnerUuid: true,
        dealerUuid: true
      }},
    },
  });

  if (!game || !game.activeRound)
    return new GameError(WebsocketErrors.InternalServerError);

  return game // TODO
}
import { Peer } from "crossws";
import prisma from "~/server/lib/prisma";
import { GameError } from "~/server/websocket/errorWrapper";
import { roundStateTransition } from "~/server/websocket/helper/stateTransition";

/**
 * Writes _Reizen_ winner to db
 * and notifies all players about
 * the round state change
 */
export async function finishReizen(
  peer: Peer,
  roundId: number,
  currentPlayerUUID: string
) {
  const round = await prisma.$transaction(async (tx) => {
    const passedRows = await tx.binokelReizAction.findMany({
      where: { roundId, passed: true },
      select: { playerUuid: true },
      distinct: ["playerUuid"],
    });
    const passedSet = new Set(passedRows.map((r) => r.playerUuid));

    // we need all players in case not all players
    // have reized yet -> all passed -> last player wins without reiz
    const allPlayersRows = await tx.binokelRound.findMany({
      where: { id: roundId },
      select: { activeInGame: { select: { uuid: true } } },
    });
    const allPlayers = allPlayersRows.map((r) => r.activeInGame?.uuid);

    //TODO if all passes the player doesnt have a action 
    // last action
    const winnerActions = await tx.binokelReizAction.findFirst({
      where: {
        roundId,
        passed: false,
        bidValue: { not: null },
        playerUuid: { notIn: [...passedSet] },
      },
      distinct: ["playerUuid"],
      orderBy: [
        { playerUuid: "asc" },
        { createdAt: "desc" },
      ],
      select: {
        playerUuid: true,
        bidValue: true,
      },
    });

    if (!winnerActions)
      throw new GameError("") // TODO better


    const round = await tx.binokelRound.update({
      where: { id: roundId },
      data: {
        reizWinnerUuid: winnerActions.playerUuid,
        reizValue: winnerActions.bidValue
      }
    })

    return round
  });

  if(!round)
    return // TODO better retun

  await roundStateTransition(
    peer,
    round.id,
    round.state, // RoundState.REIZING
    currentPlayerUUID
  )
}
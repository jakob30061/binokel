import prisma from "~/server/lib/prisma";
import { getNextPlayer, getPlayerDirection } from "~/server/websocket/helper/player";

export async function getNextReizPlayerUUID(
  roundId: number,
  startPlayerUuid: string,
  direction: "left" | "right" = "left"
): Promise<string | null | "finished"> {
  const roundData = await prisma.binokelRound.findUnique({
    where: { id: roundId },
    include: {
      reizActions: { orderBy: { createdAt: 'asc' } },
      game: {
        include: {
          players: {
            select: { uuid: true }
          }
        }
      }
    }
  });

  if (!roundData)
    throw new Error(`Round ${roundId} not found`);


  const allActions = roundData.reizActions;
  const realActions = allActions.filter(a =>
    // keep everything except exactly the one default 200 by the start player
    !(a.playerUuid === startPlayerUuid && a.bidValue === 200 && !a.passed)
  );

  const players = roundData.game.players.map((u) => u.uuid);
  if (players.length === 0)
    throw new Error("No players found for this game");

  if (realActions.length === 0) {
    // TODO something went wrong
    // create defaukt bid for startPlayer
    return getNextPlayer(startPlayerUuid, players);
  }

  const passedSet = new Set<string>(
    allActions.filter((a) => a.passed).map((a) => a.playerUuid)
  );
  const active = players.filter((u) => !passedSet.has(u));

  if (active.length <= 1)
    return "finished"

  const seatingOrder = getPlayerDirection(players).map((x) => x.uuid);
  const step = direction === "left" ? 1 : -1;
  const n = seatingOrder.length;

  const nextActiveFrom = (uuid: string): string | null => {
    let idx = seatingOrder.indexOf(uuid);
    for (let offs = 1; offs < n; offs++) {
      const cand = seatingOrder[(idx + offs * step + n) % n];
      if (!passedSet.has(cand)) return cand;
    }
    return null;
  };

  const last = realActions[realActions.length - 1];

  if(!last)
    throw new Error(`Round ${roundId} not found`);

  if (last.passed) {
    const winner =
      [...realActions]
        .reverse()
        .find((a) => a.playerUuid !== last.playerUuid)
        ?.playerUuid ?? null;

    // if there *was* a prior bidder, pivot from them;
    // otherwise pivot from the passer (last.playerUuid)
    const pivot = winner ?? last.playerUuid;
    return nextActiveFrom(pivot);
  }

  const opponent =
    [...realActions]
      .reverse()
      .find(
        (a) =>
          a.playerUuid !== last.playerUuid && !passedSet.has(a.playerUuid)
      )?.playerUuid ?? null;

  return opponent ?? nextActiveFrom(last.playerUuid);
}
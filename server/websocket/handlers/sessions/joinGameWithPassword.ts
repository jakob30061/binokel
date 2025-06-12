import prisma from "~/server/lib/prisma";
import type { Peer } from 'crossws';
import { errorHandling, GameError } from "../../errorWrapper";
import { joinGame } from "./joinGame";
import { JoinGameWithPasswordData } from "../../../../shared/types/zod/actions/joinGame";
import channels from "~/server/websocket/helper/channels";

export const handleJoinGameWithPassword = errorHandling(async (peer: Peer, gameEvent: any) => {
  const body = JoinGameWithPasswordData.parse(gameEvent);

  const [row] = await prisma.$queryRaw<{ password: string | null }[]>`
    SELECT password FROM BinokelGame WHERE pin = ${body.data.gamePin} LIMIT 1`;

  const game = await prisma.binokelGame.findFirstOrThrow({
    where: { pin: body.data.gamePin },
    select: {
      uuid: true,
      maxPlayer: true,
      players: { select: { uuid: true } }
    }
  });

  if (row?.password && row.password !== body.data.password) throw new GameError('Password not correct');

  joinGame(peer, {
    gamePin: body.data.gamePin,
    playerUUID: body.data.playerUUID
  });
});
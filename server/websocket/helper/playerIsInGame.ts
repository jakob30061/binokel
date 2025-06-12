import prisma from "~/server/lib/prisma"

export async function playerIsInGame(
  gamePin: string,
  playerUUID: string,
): Promise<boolean> {
  if (!gamePin || !playerUUID) return false;
  
  const count = await prisma.binokelGame.count({
    where: {
      pin: gamePin,
      players: {
        some: { uuid: playerUUID },
      },
    },
  });

  return count > 0;
}

export default {
  playerIsInGame
}
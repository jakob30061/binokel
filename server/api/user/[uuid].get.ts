import prisma from "~/server/lib/prisma";

export default defineEventHandler(async (event) => {
  const { uuid } = event.context.params as { uuid: string };

  try {
    const user = await prisma.user.findUniqueOrThrow({ where: { uuid } });

    return {
      success: true,
      data: {
        user
      }
    }
  } catch (error) {
    setResponseStatus(event, 404);
    return {
      success: false,
      error: WebsocketErrors.PlayerNotFound
    };
  }
})
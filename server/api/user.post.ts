import prisma from "~/server/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = CreateUserData.parse(await readBody(event));
  
  const user = await prisma.user.create({
    data: {
      language: body.language
    }
  })

  return {
    success: true,
    error: '',
    data: {
      user
    }
  }
})
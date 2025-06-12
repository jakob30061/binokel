function getGameChannel(gameUUID: string) {
  return `binokel:${gameUUID}`
}

function getUserChannel(userUUID: string) {
  return `user:${userUUID}`
}

export default {
  getGameChannel,
  getUserChannel
}
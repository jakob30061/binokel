export default defineNuxtRouteMiddleware((to, from) => {
  return // TODO make use of
  if (to.params.slug?.length === CONFIG.GAME_PIN_LENGTH) {
    // check if player is in game
    return abortNavigation()
  }

  if (to.path !== '/')
    return navigateTo('/')
})
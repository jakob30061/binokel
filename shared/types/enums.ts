export * from './generated/prisma'

export enum WebsocketTypes {
  JoinGame = "JOIN_GAME",
  JoinGameWithPassword = "JOIN_GAME_WITH_PWD",
  PlayerIsInGame = "PLAYER_IS_IN_GAME",
  NEW_PLAYER_JOINED = "NEW_PLAYER_JOINED",

  CreateGame = "CREATE_GAME",
  StartGame = "START_GAME",
  Reizen = "REIZEN",
  SUBMIT_DABB = "SUBMIT_DABB",
  SetTrump = "SET_TRUMP",
  MakeMeld = "MELD_POINTS",
  PLAY_CARD = "PLAY_CARD",
  PLAYED_CARD_ACCEPTED = "PLAYED_CARD_ACCEPTED",

  GameState = "GAME_STATE",

  ChatMessage = "CHAT_MESSAGE"
}

export enum WebsocketErrors {
  NoValidGamePin,
  PlayerNotFound,
  PlayerNotInGame,
  InvalidRoundState,
  InternalServerError = 500,
}
// Session handlers
import { handleJoinGameWithPassword } from "../websocket/handlers/sessions/joinGameWithPassword";
// Game handlers
import { handleCreateGame } from "../websocket/handlers/game/createGame";
import { setReizValue } from "../websocket/handlers/game/reizen/reizen";
import { getGameState } from "../websocket/handlers/game/getGameStateHandler";
import { handlePlayCard } from "../websocket/handlers/game/playCard";
import { Peer } from "crossws";
import z from "zod";
import { playerIsInGame } from "../websocket/helper/playerIsInGame";
import { GameError } from "../websocket/errorWrapper";
import { setTrump } from "../websocket/handlers/game/setTrump";
import { meldPoints } from "../websocket/handlers/game/meld";
import { handleJoinGame } from "../websocket/handlers/sessions/joinGame";
import { handlePlayerIsInGame } from "../websocket/handlers/sessions/checkIfPlayerInGame";

type Handler = (peer: Peer, msg: BasicRequestData) => Promise<void>;
const HANDLERS: Partial<Record<WebsocketTypes, Handler>> = {
  [WebsocketTypes.JoinGame]:             handleJoinGame,
  [WebsocketTypes.JoinGameWithPassword]: handleJoinGameWithPassword,
  [WebsocketTypes.PlayerIsInGame]:       handlePlayerIsInGame,

  [WebsocketTypes.CreateGame]:           handleCreateGame,
  [WebsocketTypes.SetTrump]:             setTrump,
  [WebsocketTypes.GameState]:            getGameState,
  [WebsocketTypes.Reizen]:               setReizValue,
  [WebsocketTypes.MakeMeld]:             meldPoints,
  [WebsocketTypes.PLAY_CARD]:            handlePlayCard,
  
} as const;

type KnownAction = keyof typeof HANDLERS;
const ActionValues = z.enum(Object.keys(HANDLERS) as [KnownAction, ...KnownAction[]]);

const BasicRequestData = z.object({
  action: ActionValues,
  data: z.object({}).loose()
});
type BasicRequestData = z.infer<typeof BasicRequestData>;


/**
 * These are the actions that should *skip* the `playerIsInGame` check.
 */
const WHITELISTED_ACTIONS: WebsocketTypes[] = [
  WebsocketTypes.JoinGame,
  WebsocketTypes.JoinGameWithPassword,
  WebsocketTypes.PlayerIsInGame,
  WebsocketTypes.CreateGame,
];

export default defineWebSocketHandler({
  async message(peer, raw) {
    // TODO check what happens if not correct
    const msg = await BasicRequestData.parse(JSON.parse(raw.toString()))
    console.log(msg);
    
    const handler = HANDLERS[msg.action];
    if (!handler) {
      console.error("Unhandled action:", msg.action);
      return;
    }

    // Check if player is in game
    if (!WHITELISTED_ACTIONS.includes(msg.action)) {
      // We expect msg.data to contain gamePin & playerUUID for every non-whitelisted action.
      const { gamePin, playerUUID } = msg.data as { gamePin?: string; playerUUID?: string };

      if (!gamePin || !playerUUID) {
        console.error(
          `Missing gamePin or playerUUID for action "${msg.action}".`,
          msg.data
        );
        peer.send(
          JSON.stringify({
            action: "ERROR",
            message: "Missing gamePin or playerUUID",
          })
        );
        return;
      }

      const isInGame = await playerIsInGame(gamePin, playerUUID);
      
      if (!isInGame)
        throw new GameError(WebsocketErrors.PlayerNotInGame, msg.action);
    }

    try {
      await handler(peer, msg);
    } catch (err) {
      console.error(`Error in handler for ${msg.action}:`, err);
      peer.send(
        JSON.stringify({ action: "ERROR", message: String(err) })
      );
    }
  },
});

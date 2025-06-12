import { ResRoundState } from "../../../../shared/types/zod/actions/gameState";
import { getPlayStateForPlayer } from "./states/play";
import { getReizenStateForPlayer } from "./states/reizen";
import { getMeldenStateForPlayer } from "./states/melden";
import { getTrumpStateForPlayer } from "./states/trump";
import { gatherGlobalData, GlobalData } from "./gatherGlobalData";
import { GameError } from "../../errorWrapper";

export type GameStateByPlayer = Record<string, ResRoundState>;

/**
 * Gathers all the relevant state for one
 * or more players
 * 
 * @param playerUUID 
 * @param gameUUID 
 * @param minimal 
 * @returns 
 */
export const getGameStateForPlayers = async (
  playerUUID: string | string[],
  gameUUID: string,
  minimal?: boolean // TODO
): Promise<GameStateByPlayer | ResRoundState | undefined> => {
  const globalData = await gatherGlobalData(gameUUID, minimal)

  if (globalData instanceof GameError)
    throw globalData;

  if (Array.isArray(playerUUID)) {
    const result: GameStateByPlayer = {};
    for (const u of playerUUID) {
      result[u] = await makeState(u, globalData, minimal);
    }
    return result;
  } else {
    return await makeState(playerUUID, globalData, minimal);
  }
};

async function makeState(
  playerUUID: string,
  globalData: GlobalData, // TODO Types
  minimal?: boolean
): Promise<ResRoundState> {

  switch (globalData.activeRound.state) {
    case RoundState.REIZING: {
      const data = await getReizenStateForPlayer(playerUUID, globalData)
      return {
        success: true,
        action: WebsocketTypes.GameState,
        data: {
          state: RoundState.REIZING,
          ...data
        }
      } satisfies ResRoundState;
    }

    case RoundState.TRUMP_SELECTION: {
      const data = await getTrumpStateForPlayer(playerUUID, globalData)
      return {
        success: true,
        action: WebsocketTypes.GameState,
        data: {
          state: RoundState.TRUMP_SELECTION,
          ...data
        }
      } satisfies ResRoundState;
    }

    case RoundState.MELDING: {
      const data = await getMeldenStateForPlayer(playerUUID, globalData)
      return {
        success: true,
        action: WebsocketTypes.GameState,
        data: {
          state: RoundState.MELDING,
          ...data
        }
      } satisfies ResRoundState;
    }

    case RoundState.PLAYING: {
      const data = await getPlayStateForPlayer(playerUUID, globalData)
      return {
        success: true,
        action: WebsocketTypes.GameState,
        data: {
          state: RoundState.PLAYING,
          ...data
        }
      } satisfies ResRoundState;
    }
  
    default:
      // add default
      break;
  }
};
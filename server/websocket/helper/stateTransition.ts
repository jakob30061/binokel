import { Peer } from "crossws";
import { RoundState } from "@prisma/client";
import { type NotifyPlayers, notifyPlayers } from "../notifyHandler";
import { getGameStateForPlayers } from "./game_state";
import prisma from "~/server/lib/prisma";
import { GameError } from "../errorWrapper";
import channels from "./channels";

/**
 * Transition from one RoundState
 * to another and notifies players
 * about it
 */
export async function roundStateTransition(
  peer: Peer,
  roundId: number,
  from: RoundState,
  currentPlayerUUID: string
) {
  let nextState: RoundState | undefined
  const nextIndex = stateRank[from] + 1;

  if (nextIndex < RoundStateOrder.length)
    nextState = RoundStateOrder[nextIndex];

  if(nextState === undefined)
    throw new GameError("Missing state") // TODO Better error handling

  // update state
  const round = await prisma.binokelRound.update({
    where: { id: roundId },
    data: { state: nextState },
    select: {
      game: { 
        select: {
          uuid: true,
          players: { select: { uuid: true } }
        }
      }
    }
  })

  if(
    !round || !round?.game || !round?.game.players
    || round.game.players.length === 0
  )
    throw new GameError("Missing round")

  const playerUuids = round?.game.players.map(p => p.uuid)
  const gameStates = await getGameStateForPlayers(
    playerUuids,
    round?.game.uuid
  )

  if(!gameStates)
    throw new GameError("No Game State")

  const payload = Object.entries(gameStates).map( // Todo better we expect a type
    ([uuid, state]) => ({
      channel: currentPlayerUUID !== uuid 
        ? channels.getUserChannel(uuid)
        : undefined,
      notifyPeer: currentPlayerUUID === uuid,
      data:    state,
    } satisfies NotifyPlayers)
  );
  

  notifyPlayers(
    peer,
    payload
  )
}

/**
 * A lookup table mapping each RoundState
 * to its numeric position in `RoundStateOrder`
 */
const RoundStateOrder: RoundState[] = [
  RoundState.WAITING_FOR_PLAYERS, // weakest
  RoundState.DEALT,   
  RoundState.REIZING,
  RoundState.TRUMP_SELECTION,
  RoundState.MELDING,
  RoundState.PLAYING,
  RoundState.FINISHED             // strongest
];
const stateRank = Object.fromEntries(
  RoundStateOrder.map((s, i) => [s, i])
) as Record<RoundState, number>;
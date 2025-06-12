import { Peer } from "crossws";
import { roundStateTransition } from "../stateTransition";

export async function checkIfRoundEnded() {
}

export async function roundEndedHandler(
  peer: Peer,
  roundId: number,

  currentPlayerUUID: string
) {
  await roundStateTransition(
    peer,
    roundId,
    RoundState.PLAYING,
    currentPlayerUUID
  )
}
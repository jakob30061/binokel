export function getNextPlayer(
  currentUuid: string,
  players: string[],
  direction: "left" | "right" = "left"
): string {
  const n = players.length;
  if (n === 0) {
    throw new Error("Player list is empty");
  }

  const seatingInfo = getPlayerDirection(players);
  const sortedUuids = seatingInfo.map((entry) => entry.uuid);

  const idx = sortedUuids.indexOf(currentUuid);
  const baseIndex = idx === -1 ? 0 : idx;

  let nextIndex: number;
  if (direction === "left") {
    nextIndex = (baseIndex + 1) % n;
  } else {
    nextIndex = (baseIndex - 1 + n) % n;
  }

  return sortedUuids[nextIndex];
}

export function getPlayerDirection(
  playerUuids: string[]
): { uuid: string; seat: number }[] {
  const sorted = [...playerUuids].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

  return sorted.map((uuid, idx) => ({ uuid, seat: idx }));
}
export function getTrickWinner(
  tableCards: Record<string, Card>,
  trump: CardSuit
): string {
  const rankStrength: Record<CardRank, number> = {
    ASS:    5,
    ZEHN:   4,
    KÖNIG:  3,
    OBER:   2,
    UNTER:  1,
    SIEBEN: 0
  };

  // 2) Turn the Record into an array of plays in insertion (play) order:
  const plays = Object.entries(tableCards).map(
    ([playerUuid, card]) => ({ playerUuid, card })
  );
  if (plays.length === 0) {
    throw new Error("No cards on the table");
  }

  // determent follow suit
  const leadSuit = plays[0]!.card.type;

  const trumps = plays.filter(p => p.card.type === trump);
  const candidates = trumps.length > 0
    ? trumps
    : plays.filter(p => p.card.type === leadSuit);

  if (candidates.length === 0) {
    throw new Error("No valid candidates for trick winner");
  }

  let winner = candidates[0]!;
  for (const p of candidates.slice(1)) {
    if (rankStrength[p.card.value] > rankStrength[winner.card.value]) {
      winner = p;
    }
  }

  return winner.playerUuid;
}
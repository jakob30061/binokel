export function getPossibleMoves(
  hand: Card[],
  trump: CardSuit,
  table: Card[]
): Card[] {
  if (table.length === 0)
    return hand.slice(); // shallow copy

  const leadCard = table[0]!;
  const leadSuit = leadCard.type; // the colour that has to be followed
  const highestOnTable = table.reduce((a, b) =>
    beats(b, a, trump, leadSuit) ? b : a
  );

  const cardsOfLeadSuit = hand.filter(c => c.type === leadSuit);
  const trumpsInHand    = hand.filter(c => c.type === trump);

  // Follow-suit rule
  if (cardsOfLeadSuit.length > 0) {

    // Stichzwang – obligation to head the trick
    const winningFollowUps = cardsOfLeadSuit.filter(c =>
      beats(c, highestOnTable, trump, leadSuit)
    );
    return winningFollowUps.length > 0 ? winningFollowUps : cardsOfLeadSuit;
  }

  // Trumpfzwang – can’t follow suit => must play a trump (if we own one)
  if (trumpsInHand.length > 0) {
    const winningTrumps = trumpsInHand.filter(c =>
      // If the current highest card is a trump, only higher trumps beat it.
      // If the current highest is NOT a trump, *every* trump beats it.
      highestOnTable.type === trump
        ? beats(c, highestOnTable, trump, leadSuit)
        : true
    );
    return winningTrumps.length > 0 ? winningTrumps : trumpsInHand;
  }

  // we can play all cards
  return hand.slice();
}

function beats(
  a: Card,
  b: Card,
  trump: CardSuit,
  leadSuit: CardSuit
): boolean {
  // Trump always beats non-trump
  const aIsTrump = a.type === trump;
  const bIsTrump = b.type === trump;
  if (aIsTrump && !bIsTrump) return true;
  if (!aIsTrump && bIsTrump) return false;

  // Both same suit (either lead suit or both trump) → compare rank
  if (a.type === b.type) {
    return rankValue(a.value) > rankValue(b.value);
  }

  // Neither is trump, different suits
  // Only a card of the lead suit can beat another card when no trump is involved
  if (a.type === leadSuit && b.type !== leadSuit) return true;
  return false; // otherwise card B stays higher (also “first played wins” for ties)
}

const RANK_ORDER: CardRank[] = [
  CardRank.SIEBEN,   // weakest
  CardRank.UNTER,
  CardRank.OBER,
  CardRank.KÖNIG,
  CardRank.ZEHN,
  CardRank.ASS       // strongest
];
function rankValue(r: CardRank): number {
  return RANK_ORDER.indexOf(r);
}

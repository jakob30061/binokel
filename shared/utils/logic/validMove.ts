import { getPossibleMoves } from './possibleMoves'

export function isValidMove(
  card: Card,
  hand: Card[],
  trump: CardSuit,
  table: Card[]
): boolean {
  if (!hand.some(c => c.id === card.id)) return false;

  const playable = getPossibleMoves(hand, trump, table);
  return playable.some(c => c.id === card.id);
}
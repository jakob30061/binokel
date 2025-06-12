const rankStrength: Record<CardRank, number> = { // TODO make global for game is duplicated with entries in db
  ASS:    5,
  ZEHN:   4,
  KÖNIG:  3,
  OBER:   2,
  UNTER:  1,
  SIEBEN: 0
};

// Return highest value trump card
export function highest_trump_card(card_list: Card[], trump: CardSuit | null): Card | null {

  if (trump == null){
    return null
  }

  let highest_card: Card | null = null

  card_list.forEach(card => {
    if (card.type != trump) {
      return
    }

    if (highest_card == null) {
      highest_card = card
      return
    }

    if (rankStrength[highest_card.value] < rankStrength[card.value]) {
      highest_card = card
    }
  });

  return highest_card
}

// Return highest value card
export function highest_card(card_list: Card[]): Card | null {
  let highest_card: Card | null = null

  card_list.forEach(card => {
    if (highest_card == null) {
      highest_card = card
      return
    }

    if (rankStrength[highest_card.value] < rankStrength[card.value]) {
      highest_card = card
    }
  });

  return highest_card
}

// Sort Cards based on their rank
export function sort_cards(card_list: Card[]): Card[] {
  if (card_list.length <= 1) {
    return card_list;
  }

  const pivot: Card = card_list[card_list.length - 1];
  const left: Card[] = [];
  const right: Card[] = [];

  for (let i = 0; i < card_list.length - 1; i++) {
    if (rankStrength[card_list[i].value] < rankStrength[pivot.value]) {
      left.push(card_list[i])
    } else {
      right.push(card_list[i])
    }
  }

  return [...sort_cards(left), pivot, ...sort_cards(right)];
}

// Return stronger Card
export function get_stonger_card(card_one: Card, card_two: Card): Card {
  if (rankStrength[card_one.value] < rankStrength[card_two.value]) {
    return card_two
  }

  return card_one
}

// Return if first card is stronger than other
export function is_stronger_card(stronger_card: Card, weaker_card: Card): boolean {
  return rankStrength[weaker_card.value] < rankStrength[stronger_card.value]
}

export default {
  highest_card,
  highest_trump_card,
  is_stronger_card,
  get_stonger_card,
  sort_cards
}
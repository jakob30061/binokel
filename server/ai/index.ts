import prisma from '../lib/prisma';
import { GameError } from '../websocket/errorWrapper';
import * as util from './utils/index'
import * as AI from './types'
import {ReqMakeMeldData} from '~/shared/types';
import z from 'zod';
import * as ws from 'crossws'

export async function invokeAi(activeGameUUID: string) {
  const aiAgent = await prisma.user.create({
    data: {
      language: "en",
      activeGameId: activeGameUUID,
      isAI: true
    }
  })

  return aiAgent
}

const BasicRequestData = z.object({
  action: z.union([
    z.literal(WebsocketTypes.SetTrump),
    z.literal(WebsocketTypes.MakeMeld),
    z.literal(WebsocketTypes.PLAY_CARD),
    z.literal(WebsocketTypes.Reizen),
  ]),
  data: z.object({}).loose(),
});
type BasicRequestData = z.infer<typeof BasicRequestData>;

export async function getAIMove(gs: string) {
  try {
    const msg = await BasicRequestData.parse(JSON.parse(gs))
    console.log(msg);

    // Parse gs
    // Check if relevant
    // get gs object

    switch (msg.action) {
      case WebsocketTypes.PLAY_CARD:
        aiChooseCard(gs);
        break;
      case WebsocketTypes.SetTrump:
        aiChooseTrump(gs)
        break;
      case WebsocketTypes.MakeMeld:
        aiChooseMeld(gs)
        // send data
        break;
      case WebsocketTypes.Reizen:
        aiChooseReizen(gs)
        break;

      default:
        break;
    }
  } catch (error) {
    return
  }
}

function aiChooseCard(gs: AI.PLAY_CARD): Card {
  if(gs.hand.length === 0)
    throw new GameError("")

  const playableCards = getPossibleMoves(
    gs.hand,
    gs.trump,
    gs.table
  )

  // Value at which ai decides to be bold when playing cards. Less means ai is like "fuck it, lets do this"
  const threshold_play_trump = 0.25
  const threshold_play_card = threshold_play_trump

  /**
   * Pre-calculated helper variables
   */
  let highest_trump_table = util.highest_trump_card(gs.table, gs.trump)
  let highest_card_table: Card | null = util.highest_card(gs.table)
  let highest_trump_hand: Card | null = util.highest_trump_card(playableCards, gs.trump)
  let highest_card_hand: Card | null = util.highest_card(playableCards)
  let sorted_card_hand: Card[] = util.sort_cards(playableCards)
  let sorted_trump_hand: Card[] = highest_trump_hand == null ? [] : sorted_card_hand.filter(card => card.type == gs.trump)
  let sorted_trump_discarded: Card[] = util.sort_cards(gs.playedCards.filter(card => card.type == gs.trump))
  let sorted_card_discarded: Card[] = util.sort_cards(gs.playedCards)

  /**
   * I am the last Player
   */
  if (gs.playerAmount == gs.table.length - 1 && (gs.trump != null)) {
    
    // Tumps are on the table
    if (highest_trump_table != null && highest_trump_hand != null) {
      for (let card of sorted_trump_hand) {
        if (util.is_stronger_card(card, highest_trump_table)) {
          return card // Case 1: Trump(s) on table && I have higher trump --> Play next highest trump card
        }
      }

      for (let card of sorted_card_hand) {
        if (card.type == gs.trump) {
          continue // Skip trump cards
        }

        return card // Case 2: Trump(s) on table && I have no higher trump but other cards --> Play lowest non-trump card
      }

      return sorted_card_hand[0] // Case 3: Trump(s) on table && I have no higher trump but only trumps on hand --> Play lowest trump card
    }

    // No Trumps on the table
    for (let card of sorted_card_hand) {
      if (card.type == gs.trump) {
        continue // Skip trump cards
      }

      if (util.is_stronger_card(card, highest_card_table)) {
        return card // Case 4: No Trump(s) on table && I have higher non-trump card --> play lowest non-trump card
      }
    }

    return sorted_trump_hand[0] // Case 5: No Trump(s) on table && I have only trump cards --> play lowest trump card
  }


  /**
   * I am the first Player
   */
  if (gs.table.length == 0) {
    // I have trump cards
    if (highest_trump_hand != null) {
      let amount_trumps_in_game = gs.playerAmount <= 3 ? 5 * 2 : 6 * 2 // 5 Cards for each copy with 3 or less players; 6 Cards for each copy with 4 players

      for (let card of sorted_trump_hand) {
        // Filter cards below my card. Higher amount means better chances of winning
        let amount_filtered_trumps_discareded = sorted_trump_discarded.filter(c => !util.is_stronger_card(card, c)).length
        let score = amount_trumps_in_game / amount_filtered_trumps_discareded

        console.log("AI Decides for trump based on score: " + score + "...")

        if (threshold_play_trump <= score) {
          console.log("AI Plays trump card based on score: " + score)
          return card // Case 6: Check for each trump in my hand if it is woth it to play based on predefined treshold: threshold_play_trump
        }
      }
    }

    // I dont have/ dont want to play trump cards
    let amount_cards_in_game = gs.playerAmount <= 3 ? 5 * 2 * 4 : 6 * 2 * 4 // 5 Cards * 2 Copies * 4 Types with 3 or less players; 6 Cards * 2 Copies * 4 Types with 4 players

    for (let card of sorted_card_hand) {
      if (card.type == gs.trump) {
        continue // Skip trump cards
      }

      let amount_filtered_cards_discarded = sorted_card_discarded.filter(c => ((c.type == gs.trump) || (util.is_stronger_card(card, c)))).length
      let score = amount_cards_in_game / amount_filtered_cards_discarded

      console.log("AI Decides for card based on score: " + score + "...")

      if (threshold_play_card <= score) {
        console.log("AI plays card based on score: " + score)
        return card // Case 7: Check for each non-trump in my hand if it is woth it to play based on predefined treshold: threshold_play_card
      }
    }

    // Play the lowest non-trump card
    for (let card of sorted_card_hand) {
      if (card.type == gs.trump) {
        continue // Skip trump cards
      }

      return card // Case 8: Play the lowest non-trump card, beacause I will probably loose based on threshold
    }

    // Base case
    return sorted_card_hand[0] // Case 9: Play the lowest (trump) card
  }


  /**
   * I am betwen Players
   */

  // I have already lost based on the cards on the table

  // Trump on table and I dont have trumps
  const case_dont_have_trump = (highest_trump_table != null && highest_trump_hand == null)

  // Trump on table higher than my highest trump
  const case_cant_beat_trump = (highest_trump_table != null && highest_trump_hand != null && util.is_stronger_card(highest_trump_table, highest_trump_hand))

  // Card on table higher than my highest card
  const case_cant_beat_cards = (highest_card_table != null && highest_card_hand != null && util.is_stronger_card(highest_card_table, highest_card_hand))


  if (case_dont_have_trump || case_cant_beat_trump || case_cant_beat_cards) {
    // Play the lowest non-trump card
    for (let card of sorted_card_hand) {
      if (card.type == gs.trump) {
        continue // Skip trump cards
      }

      return card // Case 10: Play the lowest non-trump card, beacause I will probably loose
    }

    return sorted_card_hand[0] // Case 11: Play the lowest (trump) card because I dont have anything left
  }

  // I might have a chance based on the cards on the table
  // I have trump cards
  if (highest_trump_hand != null) {
    let amount_trumps_in_game = gs.playerAmount <= 3 ? 5 * 2 : 6 * 2 // 5 Cards for each copy with 3 or less players; 6 Cards for each copy with 4 players

    for (let card of sorted_trump_hand) {
      // Filter cards below my card. Higher amount means better chances of winning
      let amount_filtered_trumps_discareded = sorted_trump_discarded.filter(c => !util.is_stronger_card(card, c)).length + 
                                              gs.table.filter(c => ((c.type == gs.trump) && !util.is_stronger_card(card, c))).length
      let score = amount_trumps_in_game / amount_filtered_trumps_discareded

      console.log("AI Decides for trump based on score: " + score + "...")

      if (threshold_play_trump <= score) {
        console.log("AI Plays trump card based on score: " + score)
        return card // Case 12: Check for each trump in my hand if it is woth it to play based on predefined treshold: threshold_play_trump
      }
    }
  }

  // I dont have/ dont want to play trump cards
  let amount_cards_in_game = gs.playerAmount <= 3 ? 5 * 2 * 4 : 6 * 2 * 4 // 5 Cards * 2 Copies * 4 Types with 3 or less players; 6 Cards * 2 Copies * 4 Types with 4 players

  for (let card of sorted_card_hand) {
    if (card.type == gs.trump) {
      continue // Skip trump cards
    }

    let amount_filtered_cards_discarded = sorted_card_discarded.filter(c => ((c.type == gs.trump) || (util.is_stronger_card(card, c)))).length +
                                          gs.table.filter(c => ((c.type == gs.trump) || (util.is_stronger_card(card, c)))).length
    let score = amount_cards_in_game / amount_filtered_cards_discarded

    console.log("AI Decides for card based on score: " + score + "...")

    if (threshold_play_card <= score) {
      console.log("AI plays card based on score: " + score)
      return card // Case 13: Check for each non-trump in my hand if it is woth it to play based on predefined treshold: threshold_play_card
    }
  }

  // Play the lowest non-trump card
  for (let card of sorted_card_hand) {
    if (card.type == gs.trump) {
      continue // Skip trump cards
    }

    return card // Case 14: Play the lowest non-trump card, beacause I will probably loose
  }

  return sorted_card_hand[0] // I have really no logial move left, so play the lowest card
}

function aiChooseTrump(gs: AI.SELECT_TRUMP): CardSuit {
  const amount_eichel = gs.hand.filter(c => c.type == CardSuit.EICHEL).length
  const amount_schippen = gs.hand.filter(c => c.type == CardSuit.SCHIPPEN).length
  const amount_herz = gs.hand.filter(c => c.type == CardSuit.HERZ).length
  const amount_schellen = gs.hand.filter(c => c.type == CardSuit.SCHELLEN).length

  // Has EICHEL the most
  if (amount_eichel >= amount_schippen && amount_eichel >= amount_herz && amount_eichel >= amount_schellen) {
    return CardSuit.EICHEL
  }

  // Has SCHIPPEN the most
  if (amount_schippen >= amount_eichel && amount_schippen >= amount_herz && amount_schippen >= amount_schellen) {
    return CardSuit.SCHIPPEN
  }

  // Has HERZ the most
  if (amount_herz >= amount_eichel && amount_herz >= amount_schippen && amount_herz >= amount_schellen) {
    return CardSuit.HERZ
  }

  // Has SCHELLEN the most
  return CardSuit.SCHELLEN
}

function aiChooseMeld(gs: AI.MELD_POINTS): ReqMakeMeldData {

  let melds = findAllMelds(gs.hand, gs.trump)
  let total_meld_points = 0

  melds.forEach(meld => {
    total_meld_points += meld.points
  })
  
  return {
    action: WebsocketTypes.MakeMeld,
    data: {
        totalPoints: total_meld_points,
        melds: melds
    }
  }
}

function aiChooseReizen(gs: AI.REIZEN): number {
  let reizvalue = 200

  // berechnung

  return reizvalue
}

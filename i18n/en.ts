export default {
  dialog: {
    enter: "Enter",
    cancel: "Cancle",
    password: {
      header: "Passwortgeschützt",
      content: "Das Spiel ist mit einem Passwort geschützt. Gebe das Passwort ein um beizutreten.",
      inputLabel: "Password"
    },
    user: {
      setupHeader: "User Setup",
      pasteUUIDLabel: "Paste your UUID:",
      verifyButtonLabel: "Verify UUID",
      createNewUserButtonLabel: "Create New User",
      errorMsgUserNotFound: "User not found. Please check your UUID.",
      errorMsgVerificationError: "Error verifying UUID. Please try again.",
      errorMsgCreationError: "Could not create user. Please try again.",
      uuidHint: "Kein Konto nötig - wir erzeugen eine persönliche UUID, \
      die du speichern kannst, um dein Profil später erneut zu verknüpfen."
    },
    meld: {
      header: "Meld",
      inputPlaceholder: "Meldvalue",
      increase20: "+ 20",
      dropOut: "Drop out",
      submitMeld: "Submit meld"
    },
    reizen: {
      header: "Reizen",
      inputPlaceholder: "Reizen Value",
      increase10: "+ 10",
      decrease10: "- 10",
      dropOut: "Drop out",
      submitMeld: "Reizen"
    }
  },
  or: "or",

  binokel: {
    createGame: "Create Game",
    createGameDialog: {
      selectDecktheme: "Kartendeck auswählen",
      playerAmount: "Select player amount",
      makeGamePrivate: "Make Game private",
      aiPlayer: "Choose AI player amount",

      publicGame: {
        tooltip: "Spiel öffentlich listen",
        onLabel: "Private",
        offLabel: "Public",
      }
    },
    rules: {
      reizen: {
        title: "Bidding",
        description: `In the first phase of the game, players bid on the dabb (the face-down cards on the table).
        Each player estimates how many points they will score through melding and winning tricks.
        The goal of bidding is to win the game—that is, to take up the dabb and choose the trump suit.
        The player to the right of the dealer begins with an initial bid, typically 10 points. Then each player in turn raises in increments of 10 until someone passes.
        In Kreuzbinokel, after the first pass, the partner continues bidding so that partners can reach an agreement more quickly. The final bid is recorded to avoid later disputes.
        After the bidding is complete, the dabb is revealed and the player with the highest bid takes it and selects the trump suit.`
      },
      melden: {
        title: "Melding",
        intro:
          "After the declarer has taken up the dabb, they are the first to meld and also announce the trump suit in that turn. Combinations in hand that earn additional points are shown. The following melds are possible:",
        combinations: [
          "Binokel: the Unter of Bells and the Ober of Acorns (one card of each combination) – 40 points. Double Binokel (“Dreihunderter” or “Karle”): two Bells Unters and two Acorns Obers – 300 points.",
          "Four of a Kind: one card of the same rank from each suit. Four Aces – 100 points; four Kings – 80 points; four Obers – 60 points; four Unters – 40 points. Tens and Sevens do not count.",
          "Eight of a Kind: two cards of the same rank from each suit, worth 1 000 points (regionally varies whether Tens and Sevens count).",
          "Flush (Family): all five different card ranks of one suit (excluding the Seven). A flush is worth 100 points, or 150 points if it is in the trump suit. The pair of King and Ober contained within cannot be melded separately."
        ]
      },
      spielen: {
        title: "Playing",
        rules: [
          "Suit must be followed: A player must play a card of the same suit if they can.",
          "Trick must be won: If a player can follow suit, they must beat the current highest card by playing a higher card of that suit.",
          "Trump must be played: If a player cannot follow suit, they must play a trump card if they have one.",
          "“First played, first ruffed”: When two cards of equal rank are played, the one that was played first wins, provided no higher card or trump is played.",
          "A trump card always beats any card of another suit."
        ]
      },
      zaehlen: {
        title: "Scoring",
        description:
          "After the last trick, all point values of the won cards are added. The point values are: Ace 11, Ten 10, King 4, Ober 3, Unter 2, and Seven 0. Additionally, the winner of the last trick receives 10 points. In total, this yields 250 points per round. The card points are added to the points earned from melding and then compared to the bid value."
      }
    }
  }
}

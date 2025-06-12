export default {
  dialog: {
    enter: "Beitreten",
    cancel: "Abbrechen",
    password: {
      header: "Passwortgeschützt",
      content: "Das Spiel ist mit einem Passwort geschützt. Gebe das Passwort ein um beizutreten.",
      inputLabel: "Passwort"
    }
  },
  or: "oder",

  binokel: {
    createGame: "Neues Spiel",
    createGameDialog: {
      selectDecktheme: "Kartendeck auswählen",

      publicGame: {
        tooltip: "Spiel öffentlich listen",
        onLabel: "Privat",
        offLabel: "Öffentlich",
        
      }
    },
    rules: {
      reizen: {
        title: "Reizen",
        description:
          "In der ersten Spielphase wird um den Dabb (die verdeckten Karten auf dem Tisch) gereizt („gesteigert“). Dabei schätzt jeder Spieler ab, wie viele Augen (Punkte) er mindestens durch Melden und Gewinnen von Stichen erzielen wird. Ziel des Reizens ist es, das Spiel zu bekommen – das heißt, den Dabb aufzunehmen und die Trumpffarbe bestimmen zu dürfen. Der Spieler rechts vom Geber beginnt mit einem ersten Reiz, typischerweise 10 Augen. Anschließend erhöht jeder reihum in 10er-Schritten, bis einer passt. Beim Kreuzbinokel wird nach dem ersten Wegsagen mit dem Partner weitergereizt, damit die Partner möglichst schnell Einigkeit erzielen können. Der endgültige Reiz wird notiert, um spätere Streitigkeiten zu vermeiden. Nach Abschluss des Reizens wird der Dabb aufgedeckt und derjenige, der den höchsten Reiz erzielt hat, nimmt ihn auf und wählt die Trumpffarbe."
      },
      melden: {
        title: "Melden",
        intro:
          "Nachdem der Spielmacher den Dabb aufgenommen hat, meldet er als Erster und gibt in diesem Zug zugleich die Trumpffarbe an. Es werden Kombinationen auf der Hand gezeigt, die zusätzliche Punkte bringen. Folgende Meldungen sind möglich:",
        combinations: [
          "Binokel: Schellen-Unter und Schippen-Ober (eine Karte jeder Kombination) 40 Punkte. Doppelter Binokel („Dreihunderter“ oder „Karle“): zwei Schellen-Unter und zwei Schippen-Ober 300 Punkte.",
          "Vier Gleiche: Eine Karte gleichen Werts aus jeder Farbe. Vier Asse 100 Punkte, vier Könige 80 Punkte, vier Obers 60 Punkte, vier Unter 40 Punkte. Zehnen und Siebenen zählen hierbei nichts.",
          "Acht Gleiche: Zwei Karten gleichen Werts aus jeder Farbe, ergibt 1 000 Punkte (regional unterschiedlich, ob Zehnen und Siebenen zählen).",
          "Familie: Alle fünf unterschiedlichen Kartenwerte einer Farbe (ohne Sieben). Eine Familie zählt 100 Punkte, bei Trumpf 150 Punkte. Das darin enthaltene Paar aus König und Ober kann nicht zusätzlich gemeldet werden."
        ]
      },
      spielen: {
        title: "Spielen",
        rules: [
          "Farbzwang: Ein Spieler muss die ausgespielte Farbe bedienen, wenn er kann (er muss eine Karte derselben Farbe legen).",
          "Stichzwang: Kann ein Spieler die ausgespielte Farbe bedienen, muss er den Stich stechen, das heißt eine höhere Karte derselben Farbe spielen.",
          "Trumpfzwang: Kann die ausgespielte Farbe nicht bedient werden, muss der Spieler eine Trumpfkarte spielen, sofern vorhanden.",
          "„Z’erschd g’schbielt, z’erschd g’schdochâ“ (Zuerst gespielt, zuerst gestochen): Bei Karten gleichen Werts sticht die zuerst ausgespielte Karte, sofern keine höhere Karte oder Trumpf ausgespielt wird.",
          "Eine Trumpfkarte sticht immer alle Karten der anderen Farben."
        ]
      },
      zaehlen: {
        title: "Zählen",
        description:
          "Nach dem letzten Stich werden alle Augenwerte der gewonnenen Karten addiert. Die Augenwerte sind: Ass 11, Zehn 10, König 4, Ober 3, Unter 2 und Sieben 0. Zusätzlich erhält der Gewinner des letzten Stichs 10 Augen. Insgesamt ergeben sich so 250 Augen pro Runde. Das Kartenergebnis wird mit den erlangten Meldpunkten summiert und dann mit dem gereizten Wert verglichen."
      }
    }
  }
}
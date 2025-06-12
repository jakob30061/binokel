import pkg from '@prisma/client'
const { PrismaClient, CardSuit, CardRank } = pkg
const prisma = new PrismaClient()

async function main() {
  await prisma.card.createMany({
    data: [
      // EICHEL
      { suit: CardSuit.EICHEL,   rank: CardRank.SIEBEN, points:  0 },
      { suit: CardSuit.EICHEL,   rank: CardRank.UNTER,  points:  2 },
      { suit: CardSuit.EICHEL,   rank: CardRank.OBER,   points:  3 },
      { suit: CardSuit.EICHEL,   rank: CardRank.KÖNIG,  points:  4 },
      { suit: CardSuit.EICHEL,   rank: CardRank.ZEHN,   points: 10 },
      { suit: CardSuit.EICHEL,   rank: CardRank.ASS,    points: 11 },

      // SCHIPPEN
      { suit: CardSuit.SCHIPPEN, rank: CardRank.SIEBEN, points:  0 },
      { suit: CardSuit.SCHIPPEN, rank: CardRank.UNTER,  points:  2 },
      { suit: CardSuit.SCHIPPEN, rank: CardRank.OBER,   points:  3 },
      { suit: CardSuit.SCHIPPEN, rank: CardRank.KÖNIG,  points:  4 },
      { suit: CardSuit.SCHIPPEN, rank: CardRank.ZEHN,   points: 10 },
      { suit: CardSuit.SCHIPPEN, rank: CardRank.ASS,    points: 11 },

      // HERZ
      { suit: CardSuit.HERZ,     rank: CardRank.SIEBEN, points:  0 },
      { suit: CardSuit.HERZ,     rank: CardRank.UNTER,  points:  2 },
      { suit: CardSuit.HERZ,     rank: CardRank.OBER,   points:  3 },
      { suit: CardSuit.HERZ,     rank: CardRank.KÖNIG,  points:  4 },
      { suit: CardSuit.HERZ,     rank: CardRank.ZEHN,   points: 10 },
      { suit: CardSuit.HERZ,     rank: CardRank.ASS,    points: 11 },

      // SCHELLEN
      { suit: CardSuit.SCHELLEN, rank: CardRank.SIEBEN, points:  0 },
      { suit: CardSuit.SCHELLEN, rank: CardRank.UNTER,  points:  2 },
      { suit: CardSuit.SCHELLEN, rank: CardRank.OBER,   points:  3 },
      { suit: CardSuit.SCHELLEN, rank: CardRank.KÖNIG,  points:  4 },
      { suit: CardSuit.SCHELLEN, rank: CardRank.ZEHN,   points: 10 },
      { suit: CardSuit.SCHELLEN, rank: CardRank.ASS,    points: 11 },
    ]
  })
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
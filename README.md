# Binokel Web-App

## Tools used
- **Nuxt.js SSR** (frontend + backend)
- **Prisma ORM**
- **TailwindCSS**
- **PrimeVue**

## Installation & Development
```bash
pmpm i
```

Next create a `.env` file in the root of the project and past the following.
```
DATABASE_URL="file:./prisma/dev.db"
DISABLE_ERD=true
```

*Setup Database (Migration and seeding)*
```bash
npx prisma migrate dev
```

*Start server*
```bash
pmpm dev
```

or

```bash
pmpm build && node .output/server/index.mjs
```

You can now access the Binokel webapp under: \
[http://localhost:3000/]()
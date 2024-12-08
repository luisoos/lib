# `/lib`

Chat with all of your documents at once. Perfect for school & university.

> [!NOTE] 
> `/lib` is a web-based SaaS that lets users use huge context-aware vector AI.

## Tech Stack

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`. Both the Backend and Frontend are made using [Next.js](https://nextjs.org) with TypeScript. Furthermore, this project uses:

-   [NextAuth.js](https://next-auth.js.org)
-   [Supabase](https://supabase.com)
-   [Prisma](https://prisma.io)
-   [Tailwind CSS](https://tailwindcss.com)
-   [shadcn/ui](https://ui.shadcn.com)
-   [Prettier](https://prettier.io/)

## Installation

> [!IMPORTANT]
> This project is currently under development.

#### Install dependencies

```bash
yarn install
```

#### Serve in development

```bash
yarn dev
```

##### Commands for development

```bash
# Generate Prisma client and database schema
yarn db:generate

# Apply pending database migrations
yarn db:migrate

# Push schema changes to the database without migrations
yarn db:push

# Open Prisma Studio to view and edit data
yarn db:studio
```

#### Build

```bash
yarn build
```

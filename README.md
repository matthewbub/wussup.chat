# M6 Boilerplate

Welcome to my boilerplate. This document will help you get started with the tech stack.

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind
- Shadcn
- Clerk
- Prisma
- React-Hook-Forms

# Installation

Follow these steps to get started with m6-boilerplate:

## Clone the repository

```bash
git clone https://github.com/matthewbub/m6-boilerplate.git my-project
```

## Navigate to the project directory

```bash
cd my-project
```

## Install dependencies

With npm:

```bash
npm install
```

With yarn:

```bash
yarn
```

With pnpm:

```bash
pnpm install
```

## Set up environment variables

Create a `.env.local` file in the root of your project and add the following variables:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Leave these as-is
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
```

Also an `.env` file (Sorry, Prisma is picky - it's easier this way imo)

```env
DATABASE_URL=
```

## Configure the prisma.schema

...

Then run

```bash
npx prisma migrate dev --name init
```

Then run

```bash
npx prisma generate
```

## Run the development server

With npm:

```bash
npm run dev
```

With yarn:

```bash
yarn dev
```

With pnpm:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

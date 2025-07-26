# Wussup Chat

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind
- Shadcn
- Clerk
- Prisma

# Installation

Follow these steps to get started with wussup chat:

## Clone the repository

```bash
git clone https://github.com/matthewbub/wussup.chat.git wussup.chat
```

## Navigate to the project directory

```bash
cd wussup.chat
```

## Install dependencies

With npm:

```bash
npm install
```

## Set up environment variables

Create a `.env.local` file in the root of your project and add the following variables:

```env
OPENAI_API_KEY=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=


# dont change these
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
```

Also an `.env` file

```env
DATABASE_URL=
```

## Configure the prisma.schema

```bash
npx prisma generate
```

## Run the development server

With npm:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## TODO

- [x] improve initial ux
  - [x] rm landing page
  - [x] fix login screen it sucks
  - [x] clarify pricing. it says 5 in some places and 9 in others
- [ ] rewrite chat api in v5 ai sdk (use routing pattern)
    - [ ] Routing pattern should use vercel sdk w gemmei or somethign cheap
- [ ] fix the login redirect - it doesn't work
- [ ] figure out whats going on with the header components (we dont even haave a fuckin header)

## Changelog

- Initial release

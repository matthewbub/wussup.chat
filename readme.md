# ZCauldron

A unified AI chatbot assistant

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, update your .env.local file with the example.env.local file

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Release notes (developer)

**Production** is currently v6, and can be accessed via https://github.com/matthewbub/zcauldron.com/tree/release/v6. Changes to this branch go straight to production.

**Beta** is in `main` and is where new changes are going in. It's okay to break the build here, the end user won't be effected. This branch can be accessed via https://next.zcauldron.com

If you make a change to the production branch, you'll need to bring beta up-to-date so the both branches remain in sync. Here's an example:

```shell
git branch # release/v6
git pull # pull the latest changes
git checkout main # beta

git merge release/v6 # merge prod changes into beta so beta is up-to-date

# resolve any merge conflicts that may arise (you may need to exit vim :wq)

git push origin main # or just git push
```

Please note: You'll never need to merge beta into production. When beta is ready to bump to production, we create a new branch (e.g. release/v7) and assign the domain to that branch in Vercel.

## Versions

v0.0.1

- Chat app is alive

v0.0.2

- Auto-Title Generation

v0.0.4

- Improve application efficiency
- Add landing page
- Fix bugs

v0.0.5

Features

- A/B Modal testing
- Chat with attachments
- New Modal Selector with search, filters, and modal requests

Fixes

- Use more providers than just OpenAI
- UX enhancements

More

- Replace Supabase Auth with Clerk Auth

v6

- App rewrite (no vibe coding)
- Replace Supabase with Prisma

whats the math I would use to calculate the cost of each message sent in my AI Chat application?

Message: { inputTokens: 123, outputTokens: 456 }

Rules:

PER MILLION TOKENS
Model: gpt-4.5-preview
Input: $75.00
Output: $150.00

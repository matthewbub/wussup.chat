# Wussup Chat

A unified AI chatbot assistant

<img src="./public/ABWussupDemo.gif" width="500px" />

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

The current production release can be viewed at https://wussup.chat/version

**Production** is currently v0.0.5, and can be accessed via https://github.com/matthewbub/wussup.chat/tree/release/v0.0.5. Changes to this branch go straight to production.

**Beta** is in `main` and is where new changes are going in. It's okay to break the build here, the end user won't be effected. This branch can be accessed via https://next.wussup.chat

If you make a change to the production branch, you'll need to bring beta up-to-date so the both branches remain in sync. Here's an example:

```shell
git branch # release/v0.0.5
git pull # pull the latest changes
git checkout main # beta

git merge release/v0.0.5 # merge prod changes into beta so beta is up-to-date

# resolve any merge conflicts that may arise (you may need to exit vim :wq)

git push origin main # or just git push
```

Please note: You'll never need to merge beta into production. When beta is ready to bump to production, we create a new branch (e.g. release/v0.0.6) and assign the domain to that branch in Vercel.

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

v0.0.6

- [ ] Introduce WYSIWYG Editor
- [ ] Bulk Chat history deletion
- [ ] Fork Chats
- [ ] Free tier (Limit chats by IP)

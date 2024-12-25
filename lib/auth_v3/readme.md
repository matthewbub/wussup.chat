# Auth system

Setup

rename the .example.dev.vars to .dev.vars and add a uuid to the AUTH_KEY field

```shell
# auth with cloudflare
npx wrangler login
# opens browser window...

# confrim identity
npx wrangler whoami

# setup db
npx wrangler d1 create auth_storage --location wnam
# https://developers.cloudflare.com/workers/wrangler/commands/#d1-create

# run migrations (local)
npx wrangler d1 migrations apply auth_storage --local

# duplicate example.dev.vars > .dev.vars
# udpate with your secret values
# ...

# run dev server
npm run dev # wrangler dev

# deploy to cloudflare workers
npm run deploy # wrangler deploy

# run migrations in cloudflare
npx wrangler d1 migrations apply auth_storage --remote

# set remote env
npx wrangler secret put AUTH_KEY
npx wrangler secret put RESEND_KEY
npx wrangler secret put NO_REPLY_EMAIL
npx wrangler secret put NO_REPLY_NAME
npx wrangler secret put NO_REPLY_PASSWORD

# confirm
npx wrangler secret list
```

We're using Hono as an HTTP framework, and hosting on Cloudflare workers. First time here? Watch this vid: https://www.youtube.com/watch?v=H7Qe96fqg1M to get up to speed on Cloudflare Workers and Hono.

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

# drop local db
npx wrangler d1 execute auth_storage --local --command="DELETE FROM password_history; DELETE FROM verification_tokens; DELETE FROM refresh_tokens; DELETE FROM users;"

# view schema
npx wrangler d1 execute auth_storage --local --command="
SELECT sql FROM sqlite_master
WHERE type IN ('table', 'index')
AND name NOT LIKE 'sqlite_%'
ORDER BY type DESC, name;"
```

We're using Hono as an HTTP framework, and hosting on Cloudflare workers. First time here? Watch this vid: https://www.youtube.com/watch?v=H7Qe96fqg1M to get up to speed on Cloudflare Workers and Hono.

## Routes

Here's a map of all the routes in this service. Click an endpoint ot quickly jump to the definition

| Route Type       | Method | Endpoint                       | Description                              |
| ---------------- | ------ | ------------------------------ | ---------------------------------------- |
| Public Routes    | POST   | /v3/public/sign-up             | new user registration returns JWT        |
|                  | POST   | /v3/public/login               | user login, returns JWT                  |
|                  | POST   | /v3/public/refresh-token       | refresh access token using refresh token |
|                  | POST   | /v3/public/forgot-password     | initiate password reset                  |
|                  | POST   | /v3/public/reset-password      | complete password reset with token       |
|                  | GET    | /v3/public/verify-email/:token | verify email with token                  |
|                  | POST   | /v3/public/resend-verification | resend verification email                |
| Protected Routes | POST   | /v3/auth/logout                | invalidate current token                 |
|                  | PUT    | /v3/auth/change-password       | change password while logged in          |
|                  | GET    | /v3/auth/me                    | get current user info                    |
|                  | PUT    | /v3/auth/me                    | update user info                         |
|                  | DELETE | /v3/auth/me                    | delete account                           |
| Admin Routes     | GET    | /v3/admin/users                | list all users                           |
|                  | GET    | /v3/admin/users/:id            | get specific user                        |
|                  | PUT    | /v3/admin/users/:id/status     | modify user status (suspend/activate)    |
|                  | DELETE | /v3/admin/users/:id            | delete user account                      |

## Adding a new app

- Run the ./scripts/create-app-local.sh script
- Run the ./scripts/create-app-remote.sh script
- Configure the origin to your production domain; when you deploy to prod

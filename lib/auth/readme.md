# Auth system

We're using Hono as an HTTP framework, and hosting on Cloudflare workers. First time here? Watch this vid: https://www.youtube.com/watch?v=H7Qe96fqg1M to get up to speed on Cloudflare Workers and Hono.

```
// API Routes Structure - v3

/*
Public Routes (No Auth Required)
------------------------------*/
POST    /v3/auth/signup              // new user registration
POST    /v3/auth/login               // user login, returns JWT
POST    /v3/auth/refresh-token       // refresh access token using refresh token
POST    /v3/auth/forgot-password     // initiate password reset
POST    /v3/auth/reset-password      // complete password reset with token
GET     /v3/auth/verify-email/:token // verify email with token
POST    /v3/auth/resend-verification // resend verification email

/*
Protected Routes (Valid JWT Required)
---------------------------------*/
POST    /v3/auth/logout              // invalidate current token
PUT     /v3/auth/change-password     // change password while logged in
GET     /v3/auth/me                  // get current user info
PUT     /v3/auth/me                  // update user info
DELETE  /v3/auth/me                  // delete account

/*
Admin Routes (Admin JWT Required)
-----------------------------*/
GET     /v3/auth/users               // list all users
GET     /v3/auth/users/:id           // get specific user
PUT     /v3/auth/users/:id/status    // modify user status (suspend/activate)
DELETE  /v3/auth/users/:id           // delete user account
```

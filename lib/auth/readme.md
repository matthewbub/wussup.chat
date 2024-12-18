# Auth system

We're using Hono as an HTTP framework, and hosting on Cloudflare workers. First time here? Watch this vid: https://www.youtube.com/watch?v=H7Qe96fqg1M to get up to speed on Cloudflare Workers and Hono.

```
// API Routes Structure - v1

/*
Public Routes (No Auth Required)
------------------------------*/
POST    /v1/auth/signup              // new user registration
POST    /v1/auth/login               // user login, returns JWT
POST    /v1/auth/refresh-token       // refresh access token using refresh token
POST    /v1/auth/forgot-password     // initiate password reset
POST    /v1/auth/reset-password      // complete password reset with token
GET     /v1/auth/verify-email/:token // verify email with token
POST    /v1/auth/resend-verification // resend verification email

/*
Protected Routes (Valid JWT Required)
---------------------------------*/
POST    /v1/auth/logout              // invalidate current token
PUT     /v1/auth/change-password     // change password while logged in
GET     /v1/auth/me                  // get current user info
PUT     /v1/auth/me                  // update user info
DELETE  /v1/auth/me                  // delete account

/*
Admin Routes (Admin JWT Required)
-----------------------------*/
GET     /v1/auth/users               // list all users
GET     /v1/auth/users/:id           // get specific user
PUT     /v1/auth/users/:id/status    // modify user status (suspend/activate)
DELETE  /v1/auth/users/:id           // delete user account
```

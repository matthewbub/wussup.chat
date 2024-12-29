---
sidebar_position: 1
---

# Intro

This is a document that covers alot of ground in our internal authentication system. This is a good point of refernce if you are someone who is needing to work in this functional area. We tend to keep it locked down so this is probably the most your going to see on it. We'll try to be comprehensive.

What you can expect to see in this service is a comprehensive jwt based authentication system. This service is hosted directly on cloudflare.

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

# zcauldron

"z cauldron"

```sh
go run *.go
```

## Initial setup

Shimmy ya way on into the /cmd/dbm directory and run `go run *.go` to hit the TUI. We'll need to run the following chain of commands for development

1. Create development database
2. Seed development database

now you can run the application in development mode from the root dir. (`cd ../../`)

## Routes

### Sign Up API

Handles user registration.

#### Endpoint

`POST /signup`

#### Request

##### Form Parameters

| Parameter        | Type   | Required | Description                     |
| ---------------- | ------ | -------- | ------------------------------- |
| username         | string | Yes      | User's desired username         |
| password         | string | Yes      | User's password                 |
| confirm_password | string | Yes      | Confirmation of user's password |
| email            | string | Yes      | User's email address            |

#### Response

##### Success

- **Status Code**: 200 OK
- **Content-Type**: text/html
- **Body**: HTML page with success message

##### Error

- **Status Code**: 400 Bad Request, 409 Conflict, or 500 Internal Server Error
- **Content-Type**: text/html
- **Body**: HTML page with error message

#### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

#### Notes

- Passwords must match
- Username and email must be unique
- Passwords are hashed before storage

# zcauldron

"z cauldron"

```sh
go run *.go
```

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

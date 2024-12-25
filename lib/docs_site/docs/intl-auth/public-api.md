---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Public API

API routes that are listed with the `/v3/public` prefix do not require a Bearer token but generally revolve around gaining a valid token.

## POST `/v3/public/sign-up`

To sign up for a new account, you just need to pass a unique email and strong password (twice)

**Request**

- **Endpoint:** `POST /v3/public/sign-up`
- **Content-Type:** `application/json`

The sign-up endpoint requires three fields to create a new account. Make sure your password meets the strength requirements.

**Request Body**

| Field               | Type   | Description                                                                                                                       |
| ------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------- |
| **email**           | string | User's email address. Must be valid format and maximum 255 characters.                                                            |
| **password**        | string | Password must be 8-20 characters with at least one uppercase letter, lowercase letter, number, and special character (!@#$%^&\*). |
| **confirmPassword** | string | Must match exactly with the password field.                                                                                       |

<Tabs>
  <TabItem value="curl" label="cURL">
    ```bash
    curl -X POST 'http://example.com/v3/public/sign-up' \
    -H 'Content-Type: application/json' \
    -d '{
        "email": "user@example.com",
        "password": "yourpassword123",
        "confirmPassword": "yourpassword123"
    }'
    ```
  </TabItem>
  <TabItem value="javascript" label="JavaScript">
    ```js
    fetch('http://example.com/v3/public/sign-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'yourpassword123',
        confirmPassword: 'yourpassword123',
      }),
    })
    ```
  </TabItem>
  <TabItem value="python" label="Python">
    ```python
    import requests

    requests.post('http://example.com/v3/public/sign-up',
        json={
            'email': 'user@example.com',
            'password': 'yourpassword123',
            'confirmPassword': 'yourpassword123'
        }
    )
    ```

  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    import "net/http"

    data := `{
        "email": "user@example.com",
        "password": "yourpassword123",
        "confirmPassword": "yourpassword123"
    }`

    http.Post(
        "http://example.com/v3/public/sign-up",
        "application/json",
        strings.NewReader(data),
    )
    ```

  </TabItem>
</Tabs>

**Response**

**Success Response:** `200 OK`

```json
{
  "access_token": "string",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

All fields are required.

**Under the hood**

When we send this request, theres quite a few steps happening. Here's the general flow

1. Zod validates the password "strength"
2. Confirm the `password` matches the `confirmPassword` field
3. Use `passwordService.hashPassword` hash the password
4. Create this user in the database, assign a default `user.status` of `"pending"`
5. Use `passwordService.addToPasswordHistory` to assign the password to the users password_history
6. Use `emailService.sendVerificationEmail` to send a token for account verification
7. Use `jwtService.assignRefreshToken` to create refresh token
8. Send `SignUpResponse`

## POST `/v3/public/login`

To login to an existing account, provide your email and password.

**Request**

- **Endpoint:** `POST /v3/public/login`
- **Content-Type:** `application/json`

**Request Parameters**

| Parameter | Type   | Description                   |
| --------- | ------ | ----------------------------- |
| email     | string | Your registered email address |
| password  | string | Your account password         |

<Tabs>
  <TabItem value="curl" label="cURL">
    
  ```bash
  curl -X POST 'http://example.com/v3/public/login' \
  -H 'Content-Type: application/json' \
  -d '{
      "email": "user@example.com",
      "password": "yourpassword123"
  }'
  ```
  
  </TabItem>
  <TabItem value="javascript" label="JavaScript">
    
  ```js
  fetch('http://example.com/v3/public/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'user@example.com',
      password: 'yourpassword123',
    }),
  })
  ```
  
  </TabItem>
  <TabItem value="python" label="Python">
    
  ```python
  import requests

requests.post('http://example.com/v3/public/login',
json={
'email': 'user@example.com',
'password': 'yourpassword123'
}
)

````

</TabItem>
<TabItem value="go" label="Go">

```go
import "net/http"

data := `{
    "email": "user@example.com",
    "password": "yourpassword123"
}`

http.Post(
    "http://example.com/v3/public/login",
    "application/json",
    strings.NewReader(data),
)
````

  </TabItem>
</Tabs>

**Response**

**Success Response:** `200 OK`

```json
{
  "access_token": "string",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

All fields are required.

**Under the hood**

When we send this request, the following steps occur:

1. Check if the user exists in the database
2. Verify account status (not deleted or suspended)
3. Check if account is locked due to failed attempts
4. Validate the password using `passwordService.handleLoginAttempt`
5. If successful, use `jwtService.assignRefreshToken` to create a new token
6. Send `LoginResponse`

**Error Cases:**

| Error Case          | Message                                                                |
| ------------------- | ---------------------------------------------------------------------- |
| Account deleted     | "Account has been deleted"                                             |
| Account suspended   | "Account has been suspended. Please contact support."                  |
| Account locked      | "Account is temporarily locked. Please reset your password via email." |
| Invalid credentials | Increments failed login attempts                                       |

## POST `/v3/public/refresh-token`

Use this endpoint to obtain a new access token using your refresh token.

**Request**

- **Endpoint:** `POST /v3/public/refresh-token`
- **Content-Type:** `application/json`

**Request Parameters**

| Parameter    | Type   | Description                                                       |
| ------------ | ------ | ----------------------------------------------------------------- |
| refreshToken | string | The refresh token received from a previous login or token refresh |

<Tabs>
  <TabItem value="curl" label="cURL">
    
  ```bash
  curl -X POST 'http://example.com/v3/public/refresh-token' \
  -H 'Content-Type: application/json' \
  -d '{
      "refreshToken": "your-refresh-token"
  }'
  ```
  
  </TabItem>
  <TabItem value="javascript" label="JavaScript">
  
  ```js
  fetch('http://example.com/v3/public/refresh-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      refreshToken: 'your-refresh-token',
    }),
  })
  ```
  
  </TabItem>
  <TabItem value="python" label="Python">
  
  ```python
  import requests

requests.post('http://example.com/v3/public/refresh-token',
json={
'refreshToken': 'your-refresh-token'
}
)

````

</TabItem>
<TabItem value="go" label="Go">

```go
import "net/http"

data := `{
    "refreshToken": "your-refresh-token"
}`

http.Post(
    "http://example.com/v3/public/refresh-token",
    "application/json",
    strings.NewReader(data),
)
````

  </TabItem>
</Tabs>

**Response**

**Success Response:** `200 OK`

```json
{
  "access_token": "string",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

**Under the hood**

When we send this request, the following steps occur:

1. Verify the refresh token exists in the database
2. Validate the token hasn't expired and isn't revoked
3. Verify the associated user account is still valid using `jwtService.validateTokenAndUser`
4. Revoke the old refresh token using `jwtService.revokeRefreshToken`
5. Create a new access token using `jwtService.assignRefreshToken`
6. Send `RefreshTokenResponse`

**Error Cases:**

| Error Case            | Message                          |
| --------------------- | -------------------------------- |
| Invalid refresh token | "Invalid refresh token"          |
| Expired token         | "Invalid refresh token"          |
| Revoked token         | "Invalid refresh token"          |
| Failed token rotation | "Failed to revoke refresh token" |

## GET `/v3/public/verify-email/:token`

Use this endpoint to verify a user's email address using the token sent to their email.

**Request**

- **Endpoint:** `GET /v3/public/verify-email/:token`
- **Content-Type:** `application/json`

**Request Parameters**

| Parameter | Type   | Description                                   |
| --------- | ------ | --------------------------------------------- |
| token     | string | The verification token received in the email. |
| email     | string | The email address being verified.             |

<Tabs>
  <TabItem value="curl" label="cURL">
    
  ```bash
  curl -X GET 'http://example.com/v3/public/verify-email?token=verification-token&email=user@example.com'
  ```
  
  </TabItem>
  <TabItem value="javascript" label="JavaScript">
    
  ```js
  fetch('http://example.com/v3/public/verify-email?token=verification-token&email=user@example.com', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })
  ```
  
  </TabItem>
  <TabItem value="python" label="Python">
    
  ```python
  import requests

requests.get(
'http://example.com/v3/public/verify-email',
params={
'token': 'verification-token',
'email': 'user@example.com'
}
)

````

</TabItem>
<TabItem value="go" label="Go">

```go
import "net/http"

http.Get("http://example.com/v3/public/verify-email?token=verification-token&email=user@example.com")
````

  </TabItem>
</Tabs>

**Response**

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Under the hood**

When we send this request, the following steps occur:

1. Check for a valid verification token in the database that:
   - Is of type 'email'
   - Hasn't been used yet (used_at is NULL)
   - Hasn't expired (expires_at > current time)
2. If token is valid, update the user's status to 'active'
3. Mark the verification token as used
4. Send verification success response

**Error Cases:**

| Error Case     | Message                         |
| -------------- | ------------------------------- |
| Invalid token  | "Invalid verification token"    |
| Expired token  | "Token expired or already used" |
| Database error | "Failed to verify email"        |

## POST `/v3/public/forgot-password`

Use this endpoint to initiate the password reset process. A reset token will be sent to the provided email address if the account exists.

**Request**

- **Endpoint:** `POST /v3/public/forgot-password`
- **Content-Type:** `application/json`

**Request Body**

| Field | Type   | Description                                   |
| ----- | ------ | --------------------------------------------- |
| email | string | The email address associated with the account |

<Tabs>
  <TabItem value="curl" label="cURL">
    ```bash
    curl -X POST 'http://example.com/v3/public/forgot-password' \
    -H 'Content-Type: application/json' \
    -d '{
        "email": "user@example.com"
    }'
    ```
  </TabItem>
  <TabItem value="javascript" label="JavaScript">
    ```js
    fetch('http://example.com/v3/public/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user@example.com',
      }),
    })
    ```
  </TabItem>
  <TabItem value="python" label="Python">
    ```python
    import requests

    requests.post('http://example.com/v3/public/forgot-password',
        json={
            'email': 'user@example.com'
        }
    )
    ```

  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    import "net/http"

    data := `{
        "email": "user@example.com"
    }`

    http.Post(
        "http://example.com/v3/public/forgot-password",
        "application/json",
        strings.NewReader(data),
    )
    ```

  </TabItem>
</Tabs>

**Response**

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "If a user exists with this email, they will receive reset instructions."
}
```

**Under the hood**

When we send this request, the following steps occur:

1. Check if user exists and is eligible for password reset
   - Account must be in one of these states: 'active', 'pending', or 'temporarily_locked'
2. Generate a unique reset token using `crypto.randomUUID()`
3. Store the reset token in the database with:
   - Type: 'password_reset'
   - Expiration: 1 hour from creation
4. Send reset email containing:
   - Reset URL with token
   - Expiration information
5. Return success message (same response regardless of whether email exists for security)

**Error Cases:**

| Error Case             | Message                                      |
| ---------------------- | -------------------------------------------- |
| Account not eligible   | "Account is not eligible for password reset" |
| Token creation failure | "Failed to create reset token"               |
| Email sending failure  | Internal server error                        |
| Database errors        | Internal server error                        |

:::info

- Response message is intentionally vague to prevent email enumeration
- Reset tokens expire after 1 hour
- Reset links are single-use only

:::

## POST `/reset-password`

Use this endpoint to complete the password reset process using the token received via email.

**Request**

- **Endpoint:** `POST /reset-password`
- **Content-Type:** `application/json`

**Request Parameters**

| Parameter | Type   | Description                                                 |
| --------- | ------ | ----------------------------------------------------------- |
| token     | string | The reset token received from the forgot password email.    |
| password  | string | The new password. Must meet password strength requirements. |

<Tabs>
  <TabItem value="curl" label="cURL">
  
  ```bash
  curl -X POST 'http://example.com/reset-password' \
  -H 'Content-Type: application/json' \
  -d '{
      "token": "reset-token-from-email",
      "password": "newSecurePassword123!"
  }'
  ```

  </TabItem>
  <TabItem value="javascript" label="JavaScript">
  
  ```js
  fetch('http://example.com/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: 'reset-token-from-email',
      password: 'newSecurePassword123!',
    }),
  })
  ```

  </TabItem>
  <TabItem value="python" label="Python">
  
  ```python
  import requests

requests.post('http://example.com/reset-password',
json={
'token': 'reset-token-from-email',
'password': 'newSecurePassword123!'
}
)

````

</TabItem>
<TabItem value="go" label="Go">

```go
import "net/http"

data := `{
    "token": "reset-token-from-email",
    "password": "newSecurePassword123!"
}`

http.Post(
    "http://example.com/reset-password",
    "application/json",
    strings.NewReader(data),
)
````

  </TabItem>
</Tabs>

**Response**

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

**Under the hood**

When we send this request, the following steps occur:

1. Verify the reset token is:
   - Valid and unexpired
   - Of type 'password_reset'
   - Not already used
2. Check user account status (not deleted or suspended)
3. Hash the new password
4. Check password history to prevent reuse
5. In a single transaction:
   - Update the user's password
   - Reset failed login attempts and locks
   - Mark the reset token as used
   - Add new password to password history
6. Send success response

**Error Cases:**

| Error Case            | Message                                      |
| --------------------- | -------------------------------------------- |
| Invalid/expired token | "Invalid or expired reset token"             |
| Account not eligible  | "Account is not eligible for password reset" |
| Password reuse        | "Cannot reuse a recent password"             |
| Transaction failure   | "Failed to update password"                  |

:::info

- Password must meet strength requirements
- Previous passwords cannot be reused
- Reset tokens are single-use only
- Account status is verified before allowing reset

:::

## POST `/v3/public/resend-verification`

Use this endpoint to request a new verification email if the original one expired or was lost.

**Request**

- **Endpoint:** `POST /v3/public/resend-verification`
- **Content-Type:** `application/json`

**Request Parameters**

| Parameter | Type   | Description                               |
| --------- | ------ | ----------------------------------------- |
| email     | string | The email address that needs verification |

<Tabs>
  <TabItem value="curl" label="cURL">
    
  ```bash
  curl -X POST 'http://example.com/v3/public/resend-verification' \
  -H 'Content-Type: application/json' \
  -d '{
      "email": "user@example.com"
  }'
  ```

  </TabItem>
  <TabItem value="javascript" label="JavaScript">
    
  ```js
  fetch('http://example.com/v3/public/resend-verification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'user@example.com',
    }),
  })
  ```

  </TabItem>
  <TabItem value="python" label="Python">
    
  ```python
  import requests

requests.post('http://example.com/v3/public/resend-verification',
json={
'email': 'user@example.com'
}
)

````

</TabItem>
<TabItem value="go" label="Go">

```go
import "net/http"

data := `{
    "email": "user@example.com"
}`

http.Post(
    "http://example.com/v3/public/resend-verification",
    "application/json",
    strings.NewReader(data),
)
````

  </TabItem>
</Tabs>

**Response**

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Verification email has been resent"
}
```

**Under the hood**

When we send this request, the following steps occur:

1. Find the user and verify they exist and are still pending
2. Check if user is already verified (status is 'active')
3. Verify user status allows for verification resend
4. Check rate limiting (minimum 5-minute wait between requests)
5. Generate and store new verification token
6. Send new verification email via `emailService.sendVerificationEmail`

**Error Cases:**

- Email already verified: "Email is already verified"
- Invalid status: "Unable to resend verification email"
- Rate limit: "Please wait 5 minutes before requesting another verification email"
- Email sending failure: "Failed to send verification email"

:::info

- Rate limiting prevents abuse
- Same response is returned whether email exists or not
- Only pending accounts can receive verification emails
- Previous verification tokens remain valid until used or expired

:::

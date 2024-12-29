---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Auth API

## Logout

Use this endpoint to invalidate your current authentication token and log out of your account.

### Request

- **Endpoint:** `POST /v3/auth/logout`
- **Content-Type:** `application/json`
- **Authorization:** Bearer token required

<Tabs>
  <TabItem value="curl" label="cURL">
    ```bash
    curl -X POST 'http://example.com/v3/auth/logout' \
    -H 'Authorization: Bearer your-access-token'
    ```
  </TabItem>
  <TabItem value="javascript" label="JavaScript">
    ```js
    fetch('http://example.com/v3/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer your-access-token'
      }
    })
    ```
  </TabItem>
  <TabItem value="python" label="Python">
    ```python
    import requests

    requests.post(
        'http://example.com/v3/auth/logout',
        headers={
            'Authorization': 'Bearer your-access-token'
        }
    )
    ```

  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    import "net/http"

    req, _ := http.NewRequest("POST", "http://example.com/v3/auth/logout", nil)
    req.Header.Add("Authorization", "Bearer your-access-token")

    client := &http.Client{}
    client.Do(req)
    ```

  </TabItem>
</Tabs>

### Response

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

**Under the hood**

When we send this request, the following steps occur:

1. Validate the Bearer token from the Authorization header
2. Find the refresh token in the database
3. Mark the token as revoked by setting `revoked_at` to current timestamp
4. Return success response

**Error Cases:**

- No token provided: "No token provided"
- Invalid token: "Invalid token"
- Token already revoked: "Failed to logout"
- Database error: "Failed to logout"

**Security Notes:**

- Requires valid Bearer token
- Token is permanently invalidated
- Cannot be used for future authentication
- All subsequent requests with the token will fail

## Change Password

Use this endpoint to change your password while logged in. Requires current password verification.

### Request

- **Endpoint:** `PUT /v3/auth/change-password`
- **Content-Type:** `application/json`
- **Authorization:** Bearer token required

### Request Parameters

### Request Parameters

- **currentPassword** (string): Your current password for verification.
- **newPassword** (string): New password. Must meet password strength requirements: 8-20 characters with at least one uppercase letter, lowercase letter, number, and special character (!@#$%^&\*).

<Tabs>
  <TabItem value="curl" label="cURL">
    ```bash
    curl -X PUT 'http://example.com/v3/auth/change-password' \
    -H 'Authorization: Bearer your-access-token' \
    -H 'Content-Type: application/json' \
    -d '{
        "currentPassword": "oldPassword123!",
        "newPassword": "newPassword456!"
    }'
    ```
  </TabItem>
  <TabItem value="javascript" label="JavaScript">
    ```js
    fetch('http://example.com/v3/auth/change-password', {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer your-access-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        currentPassword: 'oldPassword123!',
        newPassword: 'newPassword456!'
      })
    })
    ```
  </TabItem>
  <TabItem value="python" label="Python">
    ```python
    import requests

    requests.put(
        'http://example.com/v3/auth/change-password',
        headers={
            'Authorization': 'Bearer your-access-token',
            'Content-Type': 'application/json'
        },
        json={
            'currentPassword': 'oldPassword123!',
            'newPassword': 'newPassword456!'
        }
    )
    ```

  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    import "net/http"

    data := `{
        "currentPassword": "oldPassword123!",
        "newPassword": "newPassword456!"
    }`

    req, _ := http.NewRequest("PUT",
        "http://example.com/v3/auth/change-password",
        strings.NewReader(data))
    req.Header.Add("Authorization", "Bearer your-access-token")
    req.Header.Add("Content-Type", "application/json")

    client := &http.Client{}
    client.Do(req)
    ```

  </TabItem>
</Tabs>

### Response

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Password changed successfully. Please log in with your new password."
}
```

**Under the hood**

When we send this request, the following steps occur:

1. Validate the Bearer token and get user information
2. Verify current password is correct
3. Validate new password meets strength requirements
4. Check if new password exists in password history
5. In a single transaction:
   - Hash and update the new password
   - Add new password to password history
   - Revoke all existing refresh tokens
6. Return success response

**Error Cases:**

- No token provided: "Authentication required"
- Invalid token: "Invalid token"
- Incorrect current password: "Current password is incorrect"
- Password reuse: "Cannot reuse a recent password"
- Invalid new password: Various password strength requirement messages
- Transaction failure: "Failed to update password"

:::info

- Requires current password verification
- Enforces password strength requirements
- Prevents password reuse
- Revokes all active sessions (requires re-login)
- Transaction ensures atomic updates

:::

## Get Current User

Use this endpoint to retrieve information about the currently authenticated user.

### Request

- **Endpoint:** `GET /v3/auth/me`
- **Authorization:** Bearer token required

<Tabs>
  <TabItem value="cURL" label="cURL">

```bash
curl 'http://example.com/v3/auth/me' \
-H 'Authorization: Bearer your-access-token'
```

  </TabItem>
  <TabItem value="JavaScript" label="JavaScript">

```js
fetch("http://example.com/v3/auth/me", {
  headers: {
    Authorization: "Bearer your-access-token",
  },
});
```

  </TabItem>
  <TabItem value="Python" label="Python">

```python
import requests

requests.get(
    'http://example.com/v3/auth/me',
    headers={
        'Authorization': 'Bearer your-access-token'
    }
)
```

  </TabItem>
  <TabItem value="Go" label="Go">

```go
import "net/http"

req, _ := http.NewRequest("GET", "http://example.com/v3/auth/me", nil)
req.Header.Add("Authorization", "Bearer your-access-token")

client := &http.Client{}
client.Do(req)
```

  </TabItem>
</Tabs>

### Response

**Success Response:** `200 OK`

```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "username": "username",
    "status": "active",
    "role": "user",
    "email_verified": true,
    "last_login_at": "2024-01-01T00:00:00Z",
    "created_at": "2023-12-01T00:00:00Z"
  }
}
```

## Update User Profile

Use this endpoint to update the current user's email or username. Note that changing email requires re-verification.

### Request

- **Endpoint:** `PUT /v3/auth/me`
- **Content-Type:** `application/json`
- **Authorization:** Bearer token required

### Request Parameters

- **email** (string, optional): New email address. Must be unique and will require verification.
- **username** (string, optional): New username. Must be unique and 3-255 characters.

<Tabs>
  <TabItem value="cURL" label="cURL">
  
  ```bash
  curl -X PUT 'http://example.com/v3/auth/me' \
  -H 'Authorization: Bearer your-access-token' \
  -H 'Content-Type: application/json' \
  -d '{
      "email": "newemail@example.com",
      "username": "newusername"
  }'
  ```

  </TabItem>
  <TabItem value="JavaScript" label="JavaScript">
  
  ```js
  fetch('http://example.com/v3/auth/me', {
    method: 'PUT',
    headers: {
      'Authorization': 'Bearer your-access-token',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'newemail@example.com',
      username: 'newusername'
    })
  })
  ```

  </TabItem>
  <TabItem value="Python" label="Python">
  
  ```python
  import requests

requests.put(
'http://example.com/v3/auth/me',
headers={
'Authorization': 'Bearer your-access-token',
'Content-Type': 'application/json'
},
json={
'email': 'newemail@example.com',
'username': 'newusername'
}
)

````

</TabItem>
<TabItem value="Go" label="Go">

```go
import "net/http"

data := `{
    "email": "newemail@example.com",
    "username": "newusername"
}`

req, _ := http.NewRequest("PUT",
    "http://example.com/v3/auth/me",
    strings.NewReader(data))
req.Header.Add("Authorization", "Bearer your-access-token")
req.Header.Add("Content-Type", "application/json")

client := &http.Client{}
client.Do(req)
````

  </TabItem>
</Tabs>

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Profile updated. Please verify your new email address.",
  "user": {
    "email": "newemail@example.com",
    "username": "newusername",
    "email_verified": false
  }
}
```

## Delete Account

Use this endpoint to delete your account. This action is permanent and will revoke all active sessions.

### Request

- **Endpoint:** `DELETE /v3/auth/me`
- **Authorization:** Bearer token required

<Tabs>
  <TabItem value="curl" label="cURL">
  
  ```bash
  curl -X DELETE 'http://example.com/v3/auth/me' \
  -H 'Authorization: Bearer your-access-token'
  ```

  </TabItem>
  <TabItem value="javascript" label="JavaScript">
  
  ```js
  fetch('http://example.com/v3/auth/me', {
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer your-access-token'
    }
  })
  ```

  </TabItem>
  <TabItem value="python" label="Python">
  
  ```python
  import requests

requests.delete(
'http://example.com/v3/auth/me',
headers={
'Authorization': 'Bearer your-access-token'
}
)

````

</TabItem>
<TabItem value="go" label="Go">

```go
import "net/http"

req, _ := http.NewRequest("DELETE", "http://example.com/v3/auth/me", nil)
req.Header.Add("Authorization", "Bearer your-access-token")

client := &http.Client{}
client.Do(req)
````

  </TabItem>
</Tabs>

### Response

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Account successfully deleted"
}
```

**Under the hood**

For all "me" endpoints, the following security measures are in place:

1. Token validation

   - Checks token validity
   - Verifies user exists and is active
   - Confirms user has appropriate permissions

2. Profile Updates

   - Email changes trigger verification process
   - Username changes check for uniqueness
   - Updates are atomic (transaction-based)

3. Account Deletion
   - Soft delete (status change to 'deleted')
   - Revokes all active sessions
   - Preserves data for compliance

**Error Cases:**

- No token: "No token provided"
- Invalid token: "Invalid token"
- Account status issues: "Account is not active"
- Duplicate email/username: "Email/Username already taken"
- Database errors: Various specific messages

**Security Notes:**

- All endpoints require valid Bearer token
- Email changes require re-verification
- Username changes are validated
- Deletion preserves audit trail
- Rate limiting applies to all endpoints

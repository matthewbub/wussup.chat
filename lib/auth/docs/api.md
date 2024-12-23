import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Sign Up

To sign up for a new account, you just need to pass a unique email and strong password (twice)

<Tabs>
<TabItem value="curl" label="cURL">

```sh
curl -X POST 'http://example.com/sign-up' \
-H 'Content-Type: application/json' \
-d '{
    "email": "user@example.com",
    "password": "yourpassword123",
    "confirmPassword": "yourpassword123"
}'
```

</TabItem>
<TabItem value="javascript" label="JavaScript">

```javascript
fetch('http://example.com/sign-up', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({
		email: 'user@example.com',
		password: 'yourpassword123',
		confirmPassword: 'yourpassword123',
	}),
});
```

</TabItem>
<TabItem value="python" label="Python">

```python
import requests

requests.post('http://example.com/sign-up',
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
    "http://example.com/sign-up",
    "application/json",
    strings.NewReader(data),
)
```

</TabItem>
</Tabs>

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

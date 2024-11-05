# Error Codes

## Login Handler Error Codes

| Code                          | HTTP Status | Description                                                      |
| ----------------------------- | ----------- | ---------------------------------------------------------------- |
| `LOGIN_INVALID_CREDENTIALS`   | 401         | Returned when provided username/password combination is invalid  |
| `LOGIN_INACTIVE_USER`         | 401         | Returned when the user account exists but is marked as inactive  |
| `LOGIN_JWT_GENERATION_FAILED` | 500         | Returned when the system fails to generate a JWT token           |
| `LOGIN_ENV_NOT_SET`           | 500         | Returned when the required environment variable `ENV` is not set |

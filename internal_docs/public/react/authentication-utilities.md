# Authentication Utilities with Zustand

## State Properties:

- `isAuthenticated` (boolean): Tracks if the user is currently authenticated.
- `isLoading` (boolean): Indicates if an authentication-related request is in progress.
- `isSecurityQuestionsAnswered` (boolean): Tracks if security questions have been set.
- `error` (string|null): Stores any error message related to authentication.
- `user` (object|null): Contains user information (id, username, email) if authenticated.

## Methods

### `checkAuth`

Checks if the user is authenticated by making a request to `/api/v1/jwt/auth-check`. Updates the state based on the response.

### `useLogin`

Logs in the user by sending a POST request to `/api/v1/jwt/login`. Updates state based on the response.

### `useLogout`

Logs out the user by sending a POST request to `/api/v1/jwt/logout`. Clears user state on success.

### `useSignup`

Registers a new user with username, email, password, confirm password, and terms accepted. Sends a POST request to `/api/v1/jwt/sign-up`

### `useSecurityQuestions`

Submits security questions and answers for the user. Sends a POST request to `/api/v1/jwt/security-questions`.

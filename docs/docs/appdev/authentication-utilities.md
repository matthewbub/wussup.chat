# Authentication Utilities (Client)

The client side (React) application has a few helpful state properties and an `Authorized` React component to help with building out interactive UIs. We try to set up most of this stuff for you, but it's still helpful to understand.

## Authorized

The Authorized component conditionally renders its children based on the user’s authentication status. If the user is authenticated, it displays the children. Otherwise, it redirects to the login page.

```tsx
<Authorized>
  <ProtectedComponent />
</Authorized>
```

## State Properties

### `isAuthenticated`

(boolean): Tracks if the user is currently authenticated.

### `isLoading`

(boolean): Indicates if an authentication-related request is in progress.

### `isSecurityQuestionsAnswered`

(boolean): Tracks if security questions have been set.

### `error`

(string|null): Stores any error message related to authentication.

### `user`

(object|null): Contains user information (id, username, email) if authenticated.

## Methods

### `checkAuth`

Checks if the user is authenticated by making a request to `/api/v1/auth-check`. Updates the state based on the response.

```tsx
const { checkAuth } = useAuthStore();

useEffect(() => {
  checkAuth();
}, []);
```

### `useLogin`

Logs in the user by sending a POST request to `/api/v1/account/login`. Updates state based on the response.

```tsx
const { useLogin } = useAuthStore();
const login = useLogin();

const handleLogin = async () => {
  await login({
    username: "johndoe",
    password: "secretpassword",
  });
};
```

### `useLogout`

Logs out the user by sending a POST request to `/api/v1/account/logout`. Clears user state on success.

```tsx
const { useLogout } = useAuthStore();
const logout = useLogout();

const handleLogout = async () => {
  await logout();
};
```

### `useSignup`

Registers a new user with username, email, password, confirm password, and terms accepted. Sends a POST request to `/api/v1/account/sign-up`

```tsx
const { useSignup } = useAuthStore();
const signup = useSignup();

const handleSignup = async () => {
  await signup({
    username: "johndoe",
    email: "john@example.com",
    password: "secretpassword",
    confirmPassword: "secretpassword",
    termsAccepted: true,
  });
};
```

### `useSecurityQuestions`

Submits security questions and answers for the user. Sends a POST request to `/api/v1/account/security-questions`.

```tsx
const { useSecurityQuestions } = useAuthStore();
const submitQuestions = useSecurityQuestions();

const handleSecurityQuestions = async () => {
  await submitQuestions([
    { questionId: 1, answer: "Blue" },
    { questionId: 2, answer: "New York" },
  ]);
};
```

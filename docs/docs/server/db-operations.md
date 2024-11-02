# User Database Operations

This package provides database operations for user management.

## Functions

### InsertUserIntoDatabase

Creates a new user in the database with a generated UUID.

```go
err := operations.InsertUserIntoDatabase("johndoe", "hashedPassword123", "john@example.com")
if err != nil {
    log.Fatal(err)
}
```

### UpdateUserSecurityQuestionsAnswered

Marks a user's security questions as answered.

```go
err := operations.UpdateUserSecurityQuestionsAnswered("user-uuid-here")
if err != nil {
    log.Fatal(err)
}
```

### GetUserFromDatabase

Retrieves a user by username without password information.

```go
user, err := operations.GetUserFromDatabase("johndoe")
if err != nil {
    log.Fatal(err)
}
fmt.Printf("User ID: %s, Email: %s\n", user.ID, user.Email)
```

### GetUserByID

Retrieves a user by their UUID without password information.

```go
user, err := operations.GetUserByID("user-uuid-here")
if err != nil {
    log.Fatal(err)
}
```

### GetUserWithPasswordByID

Retrieves a user by their UUID, including password hash (for authentication purposes).

```go
user, err := operations.GetUserWithPasswordByID("user-uuid-here")
if err != nil {
    log.Fatal(err)
}
```

### UpdateUserPassword

Updates a user's password and records it in password history.

```go
err := operations.UpdateUserPassword("user-uuid-here", "newHashedPassword123")
if err != nil {
    log.Fatal(err)
}
```

### GetUserWithPasswordByUserName

Retrieves a user by username, including password hash (for authentication purposes).

```go
user, err := operations.GetUserWithPasswordByUserName("johndoe")
if err != nil {
    log.Fatal(err)
}
```

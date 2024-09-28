package utils

import (
	"errors"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

// GetSession retrieves the session from the Gin context
func GetSession(c *gin.Context) sessions.Session {
	session := sessions.Default(c)
	return session
}

func GetUserFromSession(c *gin.Context) (*User, error) {
	session := GetSession(c)
	userID, ok := session.Get("user_id").(int)
	if !ok {
		// TODO redirect to login page
		return nil, errors.New("user not found in session")
	}
	username, ok := session.Get("username").(string)
	if !ok {
		return nil, errors.New("username not found in session")
	}
	email, ok := session.Get("email").(string)
	if !ok {
		return nil, errors.New("email not found in session")
	}
	return &User{ID: userID, Username: username, Email: email}, nil
}

type User struct {
	ID       int
	Username string
	Email    string
}

package utils

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
)

func GetUserWithRoleByID(userID string) (*UserWithRole, error) {
	db := GetDB()

	user := UserWithRole{}

	stmt, err := db.Prepare("SELECT id, username, email, security_questions_answered, application_environment_role, password FROM active_users WHERE id = ?")
	if err != nil {
		log.Println(err)
		return nil, err
	}

	err = stmt.QueryRow(userID).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.SecurityQuestionsAnswered,
		&user.ApplicationEnvironmentRole,
		&user.Password,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("user not found")
		}
		log.Println(err)
		return nil, err
	}

	return &user, nil
}

// GetAuthenticatedUser retrieves and validates the authenticated user from the context
func GetAuthenticatedUser(c *gin.Context) (*UserWithRole, error) {
	// Retrieve the JWT from the cookie
	tokenString, err := c.Cookie("jwt")
	if err != nil || tokenString == "" {
		return nil, fmt.Errorf("no token provided")
	}

	env := os.Getenv("ENV")

	// Verify cookie is secure in production
	if env == "production" {
		if !c.Request.Cookies()[0].Secure || !c.Request.Cookies()[0].HttpOnly {
			return nil, fmt.Errorf("invalid cookie settings")
		}
	}

	// Verify the JWT and get the user ID
	userID, _, err := VerifyJWT(tokenString)
	if err != nil {
		return nil, fmt.Errorf("invalid token")
	}

	// Check if user exists in the database
	user, err := GetUserWithRoleByID(userID)
	if err != nil || user == nil {
		return nil, fmt.Errorf("user not found")
	}

	if user.InactiveAt.Valid {
		return nil, fmt.Errorf("user account is inactive")
	}

	return user, nil
}

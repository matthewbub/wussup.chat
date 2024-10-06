package utils

import (
	"fmt"
	"log"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

// GetSession retrieves the session from the Gin context
func GetSession(c *gin.Context) sessions.Session {
	session := sessions.Default(c)
	return session
}

func GetUserFromSession(c *gin.Context) (*UserObject, error) {
	session := GetSession(c)
	userID, ok := session.Get("user_id").(string)
	if !ok {
		log.Println("user_id not found in session")
		return nil, fmt.Errorf("user_id not found in session")
	}
	username, ok := session.Get("username").(string)
	if !ok {
		log.Println("username not found in session")
		return nil, fmt.Errorf("username not found in session")
	}
	email, ok := session.Get("email").(string)
	if !ok {
		log.Println("email not found in session")
		return nil, fmt.Errorf("email not found in session")
	}

	// confirm all fields match what is in the database
	db := Db()
	defer db.Close()

	var user UserObject
	err := db.QueryRow("SELECT id, username, email, security_questions_answered FROM users WHERE id = ?", userID).Scan(&user.ID, &user.Username, &user.Email, &user.SecurityQuestionsAnswered)
	if err != nil {
		log.Println("user not found in database")
		return nil, fmt.Errorf("user not found in database")
	}

	fmt.Printf("user: %v\n", user)
	if user.Username != username || user.Email != email || user.ID != userID {
		log.Println("session data does not match database")
		return nil, fmt.Errorf("session data does not match database")
	}

	return &UserObject{ID: userID, Username: username, Email: email, SecurityQuestionsAnswered: user.SecurityQuestionsAnswered}, nil
}

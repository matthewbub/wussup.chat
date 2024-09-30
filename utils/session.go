package utils

import (
	"log"
	"net/http"

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
		c.Redirect(http.StatusSeeOther, "/login")
	}
	username, ok := session.Get("username").(string)
	if !ok {
		log.Println("username not found in session")
		c.Redirect(http.StatusSeeOther, "/login")
	}
	email, ok := session.Get("email").(string)
	if !ok {
		log.Println("email not found in session")
		c.Redirect(http.StatusSeeOther, "/login")
	}

	// confirm all fields match what is in the database
	db := Db()
	defer db.Close()

	var user UserObject
	err := db.QueryRow("SELECT * FROM users WHERE id = ?", userID).Scan(&user.ID, &user.Username, &user.Email)
	if err != nil {
		log.Println("user not found in database")
		c.Redirect(http.StatusSeeOther, "/login")
	}

	if user.Username != username || user.Email != email || user.ID != userID {
		log.Println("ur hella suspicious")
		c.Redirect(http.StatusSeeOther, "/login")
	}

	return &UserObject{ID: userID, Username: username, Email: email}, nil
}

package api

import (
	"fmt"
	"log"
	"net/http"

	"bus.zcauldron.com/utils"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func LoginHandler(c *gin.Context) {
	// Extract form data
	username := c.PostForm("username")
	password := c.PostForm("password")
	rememberMe := c.PostForm("remember") == "on"

	// Validate input
	if username == "" || password == "" {
		renderLoginErrorPage(c, "Username and password are required")
		return
	}

	// Check user credentials
	user, err := getUserFromDatabase(username)
	if err != nil {
		handleLoginError(c, err)
		return
	}

	// Compare passwords
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		renderLoginErrorPage(c, "Invalid username or password")
		return
	}

	// Set session
	session := utils.GetSession(c)
	session.Set("user_id", user.ID)
	session.Set("username", user.Username)
	session.Set("email", user.Email)

	if rememberMe {
		session.Options(sessions.Options{
			MaxAge: 30 * 24 * 60 * 60, // 30 days in seconds
		})
	}

	if err := session.Save(); err != nil {
		renderLoginErrorPage(c, "Error creating session")
		return
	}

	// Redirect to dashboard or home page
	c.Redirect(http.StatusSeeOther, "/dashboard")
}

func getUserFromDatabase(username string) (*User, error) {
	db := utils.Db()
	defer db.Close()

	user := &User{}
	err := db.QueryRow("SELECT id, username, password, email FROM users WHERE username = ?", username).
		Scan(&user.ID, &user.Username, &user.Password, &user.Email)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func handleLoginError(c *gin.Context, err error) {
	fmt.Println("Error during login:", err)
	if err.Error() == "user not found" {
		renderLoginErrorPage(c, "Invalid username or password")
	} else {
		log.Println("Error during login:", err)
		renderLoginErrorPage(c, "An error occurred during login")
	}
}

func renderLoginErrorPage(c *gin.Context, message string) {
	c.HTML(http.StatusUnauthorized, "login.go.tmpl", gin.H{
		"title":   "Login",
		"message": message,
	})
}

type User struct {
	ID       int
	Username string
	Password string
	Email    string
}

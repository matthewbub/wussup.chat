package api

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"

	"bus.zcauldron.com/pkg/utils"
	"bus.zcauldron.com/pkg/views"
	"github.com/a-h/templ"
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
		templ.Handler(views.LogIn(views.LogInData{
			Title:   "Login",
			Message: "Username and password are required",
		}))
		return
	}

	// Check user credentials
	user, err := getUserFromDatabase(username)
	fmt.Printf("user found; but unverified: %s\n", user.ID)
	if err != nil {
		// destroy session
		session := utils.GetSession(c)
		session.Clear()
		session.Save()

		templ.Handler(views.LogIn(views.LogInData{
			Title:   "Login",
			Message: "Invalid username or password",
		})).ServeHTTP(c.Writer, c.Request)
		return
	}

	// Check if user is nil
	if user == nil {
		// destroy session
		session := utils.GetSession(c)
		session.Clear()
		session.Save()
		templ.Handler(views.LogIn(views.LogInData{
			Title:   "Login",
			Message: "Invalid username or password",
		})).ServeHTTP(c.Writer, c.Request)
		return
	}

	// Compare passwords
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		templ.Handler(views.LogIn(views.LogInData{
			Title:   "Login",
			Message: "Invalid username or password",
		})).ServeHTTP(c.Writer, c.Request)
		return
	}
	log.Println("User validated")

	// Set session only if there is data
	session := utils.GetSession(c)
	if user.ID != "" {
		session.Set("user_id", user.ID)
	}
	if user.Username != "" {
		session.Set("username", user.Username)
	}
	if user.Email != "" {
		session.Set("email", user.Email)
	}

	if rememberMe {
		session.Options(sessions.Options{
			MaxAge: 30 * 24 * 60 * 60, // 30 days in seconds
		})
	}

	if err := session.Save(); err != nil {
		templ.Handler(views.LogIn(views.LogInData{
			Title:   "Login",
			Message: "Error creating session",
		})).ServeHTTP(c.Writer, c.Request)
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
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, err
	}
	return user, nil
}

type User struct {
	ID       string
	Username string
	Password string
	Email    string
}

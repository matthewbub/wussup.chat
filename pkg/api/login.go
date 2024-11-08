package api

import (
	"database/sql"
	"errors"
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
	username := utils.SanitizeInput(c.PostForm("username"))
	password := utils.SanitizeInput(c.PostForm("password"))
	rememberMe := utils.SanitizeInput(c.PostForm("remember")) == "on"

	if username == "" || password == "" {
		handleLoginError(c, "Invalid username or password")
		return
	}

	// Check user credentials
	user, err := getUserFromDatabase(username)
	if err != nil {
		// destroy session
		session := utils.GetSession(c)
		session.Clear()
		err = session.Save()
		if err != nil {
			handleLoginError(c, "Internal server error")
			return
		}
		handleLoginError(c, "Invalid username or password")
		return
	}

	// Check if user is nil
	if user == nil {
		// destroy session
		session := utils.GetSession(c)
		session.Clear()
		err := session.Save()
		if err != nil {
			handleLoginError(c, "Internal server error")
			return
		}
		handleLoginError(c, "Invalid username or password")
		return
	}

	log.Println("user found; but unverified")

	// Compare passwords
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		handleLoginError(c, "Invalid username or password")
		return
	}
	log.Println("User validated")

	session := utils.GetSession(c)
	setSessionData(session, user, rememberMe)

	if err := session.Save(); err != nil {
		handleLoginError(c, "Internal server error")
		return
	}

	// Redirect to dashboard or home page
	c.Redirect(http.StatusSeeOther, "/dashboard")
}

func setSessionData(session sessions.Session, user *User, rememberMe bool) {
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

	session.Options(sessions.Options{
		HttpOnly: true,                    // Prevents JavaScript from accessing cookies
		Secure:   true,                    // Ensures cookies are only sent over HTTPS
		SameSite: http.SameSiteStrictMode, // Prevents CSRF attacks
	})
}

func getUserFromDatabase(username string) (*User, error) {
	db := utils.Db()
	defer func(db *sql.DB) {
		err := db.Close()
		if err != nil {
			log.Println("Something went wrong closing database")
		}
	}(db)

	user := &User{}
	err := db.QueryRow("SELECT id, username, password, email, security_questions_answered FROM active_users WHERE username = ?", username).
		Scan(&user.ID, &user.Username, &user.Password, &user.Email, &user.SecurityQuestionsAnswered)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("user not found")
		}
		return nil, err
	}
	return user, nil
}

func handleLoginError(c *gin.Context, message string) {
	session := utils.GetSession(c)
	session.Clear()
	if err := session.Save(); err != nil {
		log.Println("unable to save session")
	}
	templ.Handler(views.LogIn(views.LogInData{
		Title:   "Login",
		Message: message,
	})).ServeHTTP(c.Writer, c.Request)
}

type User struct {
	ID                        string
	Username                  string
	Password                  string
	Email                     string
	SecurityQuestionsAnswered bool
}

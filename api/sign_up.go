package api

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"bus.zcauldron.com/utils"
	"github.com/gin-gonic/gin"
	"github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
)

func SignUpHandler(c *gin.Context) {
	// Extract form data
	userData := extractUserData(c)

	// Validate passwords
	if !passwordsMatch(userData.password, userData.confirmPassword) {
		renderErrorPage(c, http.StatusBadRequest, "Passwords do not match")
		return
	}

	// password must be at least 8 characters
	if len(userData.password) < 8 {
		renderErrorPage(c, http.StatusBadRequest, "Password must be at least 8 characters")
		return
	}

	// password must contain at least one uppercase letter
	if !strings.ContainsAny(userData.password, "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
		renderErrorPage(c, http.StatusBadRequest, "Password must contain at least one uppercase letter")
		return
	}

	// password must contain at least one lowercase letter
	if !strings.ContainsAny(userData.password, "abcdefghijklmnopqrstuvwxyz") {
		renderErrorPage(c, http.StatusBadRequest, "Password must contain at least one lowercase letter")
		return
	}

	// password must contain at least one number
	if !strings.ContainsAny(userData.password, "0123456789") {
		renderErrorPage(c, http.StatusBadRequest, "Password must contain at least one number")
		return
	}

	// Hash password
	hashedPassword, err := hashPassword(userData.password)
	if err != nil {
		renderErrorPage(c, http.StatusInternalServerError, "Error processing your request")
		return
	}

	// Insert user into database
	err = insertUserIntoDatabase(userData.username, hashedPassword, userData.email)
	if err != nil {
		handleDatabaseError(c, err)
		return
	}

	// Render success page
	renderSuccessPage(c)
}

func hashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedPassword), nil
}

func extractUserData(c *gin.Context) struct {
	username, password, confirmPassword, email string
} {
	return struct {
		username, password, confirmPassword, email string
	}{
		username:        c.PostForm("username"),
		password:        c.PostForm("password"),
		confirmPassword: c.PostForm("confirm_password"),
		email:           c.PostForm("email"),
	}
}

func passwordsMatch(password, confirmPassword string) bool {
	return password == confirmPassword
}

func renderErrorPage(c *gin.Context, status int, message string) {
	c.HTML(status, "sign-up.tmpl", gin.H{
		"title":   "Sign Up",
		"message": message,
	})
}

func insertUserIntoDatabase(username, hashedPassword, email string) error {
	db := utils.Db()
	defer db.Close()

	_, err := db.Exec("INSERT INTO users (username, password, email, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
		username, hashedPassword, email, time.Now(), time.Now())
	return err
}

func handleDatabaseError(c *gin.Context, err error) {
	if sqliteErr, ok := err.(sqlite3.Error); ok && sqliteErr.ExtendedCode == sqlite3.ErrConstraintUnique {
		errorMessage := getUniqueConstraintErrorMessage(sqliteErr)
		renderErrorPage(c, http.StatusConflict, errorMessage)
	} else {
		renderErrorPage(c, http.StatusInternalServerError, "Error creating account")
	}
	fmt.Println("Error creating account:", err)
}

func getUniqueConstraintErrorMessage(err sqlite3.Error) string {
	if strings.Contains(err.Error(), "username") {
		return "Username already in use"
	} else if strings.Contains(err.Error(), "email") {
		return "Email address already in use"
	}
	return "Error creating account"
}

func renderSuccessPage(c *gin.Context) {
	c.HTML(http.StatusOK, "landing.tmpl", gin.H{
		"title":   "Landing",
		"message": "Account created successfully, please login",
	})
}

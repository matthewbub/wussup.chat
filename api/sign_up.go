package api

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"bus.zcauldron.com/routes/views"
	"bus.zcauldron.com/utils"
	"github.com/a-h/templ"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// TODO: Add a check to see if the user has agreed to the terms of service and privacy policy
// TODO: Add the user_id / password to the password table

func SignUpHandler(c *gin.Context) {
	// Extract form data
	userData, err := extractUserData(c)
	if err != nil {
		log.Printf("Error extracting user data: %v", err)
		return
	}

	// Validate passwords
	if !passwordsMatch(userData.password, userData.confirmPassword) {
		renderErrorPage(c, http.StatusBadRequest, "Passwords do not match")
		return
	}

	// password must be at least 8 characters
	if !utils.MustBe8Characters(userData.password) {
		renderErrorPage(c, http.StatusBadRequest, "Password must be at least 8 characters")
		return
	}

	// password must contain at least one uppercase letter
	if !utils.MustContainUppercase(userData.password) {
		renderErrorPage(c, http.StatusBadRequest, "Password must contain at least one uppercase letter")
		return
	}

	// password must contain at least one lowercase letter
	if !utils.MustContainLowercase(userData.password) {
		renderErrorPage(c, http.StatusBadRequest, "Password must contain at least one lowercase letter")
		return
	}

	// password must contain at least one number
	if !utils.MustContainNumber(userData.password) {
		renderErrorPage(c, http.StatusBadRequest, "Password must contain at least one number")
		return
	}

	// password must contain at least one special character
	if !utils.MustContainSpecialCharacter(userData.password) {
		renderErrorPage(c, http.StatusBadRequest, "Password must contain at least one special character")
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
		fmt.Printf("line 65 err %v\n", err)
		handleDatabaseError(c, err)
		return
	}

	// Render success page
	renderSecurityQuestionsPage(c)
}

func hashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedPassword), nil
}

func extractUserData(c *gin.Context) (struct {
	username, password, confirmPassword, email string
}, error) {

	username := utils.SanitizeInput(c.PostForm("username"))
	password := utils.SanitizeInput(c.PostForm("password"))
	confirmPassword := utils.SanitizeInput(c.PostForm("confirm_password"))
	email := utils.SanitizeInput(c.PostForm("email"))

	if !utils.IsValidUsername(username) {
		renderErrorPage(c, http.StatusBadRequest, "Invalid username")
		return struct {
			username, password, confirmPassword, email string
		}{}, fmt.Errorf("invalid username")
	}

	if !utils.IsValidEmail(email) {
		renderErrorPage(c, http.StatusBadRequest, "Invalid email")
		return struct {
			username, password, confirmPassword, email string
		}{}, fmt.Errorf("invalid email")
	}

	return struct {
		username, password, confirmPassword, email string
	}{
		username:        username,
		password:        password,
		confirmPassword: confirmPassword,
		email:           email,
	}, nil
}

func passwordsMatch(password, confirmPassword string) bool {
	return password == confirmPassword
}

func renderErrorPage(c *gin.Context, _ int, message string) {
	templ.Handler(views.SignUp(views.SignUpData{
		Title:        "Sign Up",
		IsLoggedIn:   false,
		ErrorMessage: message,
	})).ServeHTTP(c.Writer, c.Request)
}

func insertUserIntoDatabase(username, hashedPassword, email string) error {
	db := utils.Db()
	defer db.Close()

	// Use a prepared statement to prevent SQL injection
	stmt, err := db.Prepare("INSERT INTO users (id, username, password, email, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)")
	if err != nil {
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	var uuid string = uuid.New().String()
	_, err = stmt.Exec(uuid, username, hashedPassword, email, time.Now(), time.Now())
	if err != nil {
		return fmt.Errorf("failed to execute statement: %w", err)
	}

	return nil
}

func handleDatabaseError(c *gin.Context, err error) {
	if err.Error() == "failed to execute statement: UNIQUE constraint failed: users.email" {
		renderErrorPage(c, http.StatusConflict, "Email address already in use")
		return
	}

	if err.Error() == "failed to execute statement: UNIQUE constraint failed: users.username" {
		renderErrorPage(c, http.StatusConflict, "Username already in use")
		return
	}

	renderErrorPage(c, http.StatusInternalServerError, "Error creating account")
	fmt.Println("Error creating account:", err)
}

func renderSecurityQuestionsPage(c *gin.Context) {
	c.Redirect(http.StatusSeeOther, "/sign-up/security-questions")
}

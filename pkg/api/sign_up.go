package api

import (
	"fmt"
	"log"
	"net/http"

	"bus.zcauldron.com/pkg/models"
	"bus.zcauldron.com/pkg/utils"
	"bus.zcauldron.com/pkg/views"
	"github.com/a-h/templ"
	"github.com/gin-gonic/gin"
)

// TODO: Add a check to see if the user has agreed to the terms of service and privacy policy
// TODO: Add the user_id / password to the password table

func SignUpHandler(c *gin.Context) {
	// Extract form data
	userData, err := extractUserData(c)
	if err != nil {
		log.Printf("Error extracting user data: %v", err)
		renderErrorPage(c, http.StatusBadRequest, "Error extracting user data")
		return
	}

	// Validate passwords
	if !passwordsMatch(userData.password, userData.confirmPassword) {
		log.Println("Passwords do not match")
		renderErrorPage(c, http.StatusBadRequest, "Passwords do not match")
		return
	}

	// password must be at least 8 characters
	if !utils.MustBe8Characters(userData.password) {
		log.Println("Password must be at least 8 characters")
		renderErrorPage(c, http.StatusBadRequest, "Password must be at least 8 characters")
		return
	}

	// password must contain at least one uppercase letter
	if !utils.MustContainUppercase(userData.password) {
		log.Println("Password must contain at least one uppercase letter")
		renderErrorPage(c, http.StatusBadRequest, "Password must contain at least one uppercase letter")
		return
	}

	// password must contain at least one lowercase letter
	if !utils.MustContainLowercase(userData.password) {
		log.Println("Password must contain at least one lowercase letter")
		renderErrorPage(c, http.StatusBadRequest, "Password must contain at least one lowercase letter")
		return
	}

	// password must contain at least one number
	if !utils.MustContainNumber(userData.password) {
		log.Println("Password must contain at least one number")
		renderErrorPage(c, http.StatusBadRequest, "Password must contain at least one number")
		return
	}

	// password must contain at least one special character
	if !utils.MustContainSpecialCharacter(userData.password) {
		log.Println("Password must contain at least one special character")
		renderErrorPage(c, http.StatusBadRequest, "Password must contain at least one special character")
		return
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(userData.password)
	if err != nil {
		log.Printf("Error hashing password: %v", err)
		renderErrorPage(c, http.StatusInternalServerError, "Error processing your request")
		return
	}

	// Insert user into database
	err = models.InsertUserIntoDatabase(userData.username, hashedPassword, userData.email)
	if err != nil {
		log.Printf("Error inserting user into database: %v", err)
		handleDatabaseError(c, err)
		return
	}

	user, err := models.GetUserFromDatabase(userData.username)
	if err != nil {
		log.Printf("Error getting user from database: %v", err)
		renderErrorPage(c, http.StatusInternalServerError, "Error processing your request")
		return
	}

	// Set session
	session := utils.GetSession(c)
	session.Set("user_id", user.ID)
	session.Set("username", user.Username)
	session.Set("email", user.Email)

	if err := session.Save(); err != nil {
		log.Printf("Error creating session: %v", err)
		templ.Handler(views.GeneralError(views.GeneralErrorData{
			Title:   "Sign Up",
			Message: "Error creating session",
		}))
		return
	}

	// Render success page
	// c.Redirect(http.StatusSeeOther, "/sign-up/security-questions")
	c.Redirect(http.StatusSeeOther, "/sign-up/success")
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

// func renderSecurityQuestionsPage(c *gin.Context) {
// 	c.Redirect(http.StatusSeeOther, "/sign-up/security-questions")
// }

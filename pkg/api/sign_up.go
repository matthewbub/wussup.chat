package api

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"bus.zcauldron.com/pkg/api/response"
	"bus.zcauldron.com/pkg/constants"
	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

func SignUpHandler(c *gin.Context) {
	// Parse request body as JSON
	var body struct {
		Username        string `json:"username"`
		Password        string `json:"password"`
		ConfirmPassword string `json:"confirmPassword"`
		Email           string `json:"email"`
		TermsAccepted   bool   `json:"termsAccepted"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, response.Error(
			"Invalid request data",
			response.INVALID_REQUEST_DATA,
		))
		return
	}

	// BEGIN DATA VALIDATION
	if err := validateSignUpData(&body); err != nil {
		var errorCode string
		switch err.Error() {
		case "weak password":
			errorCode = response.WEAK_PASSWORD
		case "passwords do not match":
			errorCode = response.PASSWORD_MISMATCH
		default:
			errorCode = response.INVALID_REQUEST_DATA
		}
		c.JSON(http.StatusBadRequest, response.Error(
			err.Error(),
			errorCode,
		))
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Error hashing password: %v", err)
		c.JSON(http.StatusInternalServerError, response.Error(
			"Server error",
			response.OPERATION_FAILED,
		))
		return
	}

	// Insert user into the database
	userID, err := insertUserIntoDatabase(body.Username, string(hashedPassword), body.Email)
	if err != nil {
		c.JSON(http.StatusConflict, response.Error(
			"Username or email already exists",
			response.OPERATION_FAILED,
		))
		return
	}

	// Generate and set JWT
	token, err := utils.GenerateJWT(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(
			"Failed to generate token",
			response.AUTHENTICATION_FAILED,
		))
		return
	}

	cookieConfig := struct {
		Expiration time.Duration
		Domain     string
		Secure     bool
	}{
		Expiration: constants.AppConfig.DefaultJWTExpiration,
		Domain:     "",
		Secure:     true,
	}
	env := utils.GetEnv()
	if env == "production" {
		cookieConfig.Domain = constants.AppConfig.ProductionDomain
	}
	if env == "development" {
		cookieConfig.Domain = constants.AppConfig.DevelopmentDomain
		cookieConfig.Secure = false
	}

	if env == "test" {
		cookieConfig.Domain = constants.AppConfig.TestDomain
		cookieConfig.Secure = false
	}

	c.SetCookie("jwt", token, int(cookieConfig.Expiration.Seconds()), "/", cookieConfig.Domain, cookieConfig.Secure, true)
	c.JSON(http.StatusOK, response.SuccessMessage(
		"Account registration completed successfully",
	))
}

func validateSignUpData(body *struct {
	Username        string `json:"username"`
	Password        string `json:"password"`
	ConfirmPassword string `json:"confirmPassword"`
	Email           string `json:"email"`
	TermsAccepted   bool   `json:"termsAccepted"`
}) error {
	if !body.TermsAccepted {
		return fmt.Errorf("terms must be accepted")
	}
	if !utils.IsValidUsername(body.Username) {
		return fmt.Errorf("invalid username")
	}
	if !utils.IsValidEmail(body.Email) {
		return fmt.Errorf("invalid email")
	}
	if body.Password != body.ConfirmPassword {
		return fmt.Errorf("passwords do not match")
	}
	if err := utils.ValidatePasswordStrength(body.Password); err != nil {
		return fmt.Errorf("weak password")
	}
	return nil
}

func insertUserIntoDatabase(username, hashedPassword, email string) (string, error) {
	db := utils.GetDB()

	// Use a prepared statement to prevent SQL injection
	stmt, err := db.Prepare("INSERT INTO users (id, username, password, email, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)")
	if err != nil {
		log.Println(err)
		return "", fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	var uuid string = uuid.New().String()
	_, err = stmt.Exec(uuid, username, hashedPassword, email, time.Now(), time.Now())
	if err != nil {
		log.Println(err)
		return "", fmt.Errorf("failed to execute statement: %w", err)
	}

	// Insert the password into the password history
	stmt, err = db.Prepare("INSERT INTO password_history (user_id, password) VALUES (?, ?)")
	if err != nil {
		log.Println(err)
		return "", fmt.Errorf("failed to prepare password history statement: %w", err)
	}
	defer stmt.Close()

	_, err = stmt.Exec(uuid, hashedPassword)
	if err != nil {
		log.Println(err)
		return "", fmt.Errorf("failed to insert password into history: %w", err)
	}

	return uuid, nil
}

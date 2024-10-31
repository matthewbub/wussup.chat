package jwt

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"bus.zcauldron.com/pkg/constants"
	"bus.zcauldron.com/pkg/models"
	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-gonic/gin"
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
		c.JSON(http.StatusBadRequest, gin.H{"ok": false, "message": "Invalid request data"})
		return
	}

	// Check terms acceptance
	if !body.TermsAccepted {
		c.JSON(http.StatusBadRequest, gin.H{"ok": false, "message": "Terms must be accepted"})
		return
	}

	// Validate input and passwords
	if !utils.IsValidUsername(body.Username) {
		c.JSON(http.StatusBadRequest, gin.H{"ok": false, "message": "Invalid username"})
		return
	}
	if !utils.IsValidEmail(body.Email) {
		c.JSON(http.StatusBadRequest, gin.H{"ok": false, "message": "Invalid email"})
		return
	}
	if body.Password != body.ConfirmPassword {
		c.JSON(http.StatusBadRequest, gin.H{"ok": false, "message": "Passwords do not match"})
		return
	}
	if err := validatePassword(body.Password); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"ok": false, "message": err.Error()})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Error hashing password: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "message": "Server error"})
		return
	}

	// Insert user into the database
	if err := models.InsertUserIntoDatabase(body.Username, string(hashedPassword), body.Email); err != nil {
		c.JSON(http.StatusConflict, gin.H{"ok": false, "message": "Username or email already exists"})
		return
	}

	// Retrieve the user ID for JWT token generation
	user, err := models.GetUserFromDatabase(body.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "message": "Server error"})
		return
	}

	// Generate and set JWT
	token, err := utils.GenerateJWT(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "message": "Failed to generate token"})
		return
	}

	cookieConfig := struct {
		Expiration time.Duration
		Domain     string
		Secure     bool
	}{
		Expiration: constants.AppConfig.DefaultJWTExpiration,
		Domain:     constants.AppConfig.ProductionDomain,
		Secure:     true,
	}

	env := os.Getenv("ENV")
	if env == "development" {
		cookieConfig.Domain = constants.AppConfig.DevelopmentDomain
		cookieConfig.Secure = false
	}

	c.SetCookie("jwt", token, int(cookieConfig.Expiration.Seconds()), "/", cookieConfig.Domain, cookieConfig.Secure, true)
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

func validatePassword(password string) error {
	if !utils.MaxLength(password, 100) {
		return fmt.Errorf("password must be less than 100 characters")
	}
	if !utils.MustBe8Characters(password) {
		return fmt.Errorf("password must be at least 8 characters")
	}
	if !utils.MustContainUppercase(password) {
		return fmt.Errorf("password must contain at least one uppercase letter")
	}
	if !utils.MustContainLowercase(password) {
		return fmt.Errorf("password must contain at least one lowercase letter")
	}
	if !utils.MustContainNumber(password) {
		return fmt.Errorf("password must contain at least one number")
	}
	if !utils.MustContainSpecialCharacter(password) {
		return fmt.Errorf("password must contain at least one special character")
	}
	return nil
}

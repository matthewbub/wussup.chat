package jwt

import (
	"log"
	"net/http"
	"os"
	"time"

	"bus.zcauldron.com/pkg/constants"
	"bus.zcauldron.com/pkg/operations"
	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func LoginWithJWTHandler(c *gin.Context) {
	var body struct {
		Username   string `json:"username"`
		Password   string `json:"password"`
		RememberMe bool   `json:"rememberMe"`
	}
	c.BindJSON(&body)
	username := utils.SanitizeInput(body.Username)
	password := utils.SanitizeInput(body.Password)

	// Existing user validation logic
	user, err := operations.GetUserWithPasswordByUserName(username)

	// Basic validation
	if err != nil || user == nil || bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)) != nil {
		c.JSON(http.StatusUnauthorized, utils.JR(utils.JsonResponse{
			Ok:      false,
			Message: "Invalid username or password",
			Code:    "UNAUTHORIZED",
			Error:   "Invalid username or password",
		}))
		return
	}

	// Check if user is inactive
	if !user.IsActive {
		log.Println("User is inactive", user.ID)
		c.JSON(http.StatusUnauthorized, utils.JR(utils.JsonResponse{
			Ok:      false,
			Message: "Invalid username or password",
			Code:    "UNAUTHORIZED",
			Error:   "User is inactive",
		}))
		return
	}

	// Generate JWT after successful login
	jwtToken, err := utils.GenerateJWT(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.JR(utils.JsonResponse{
			Ok:      false,
			Message: "Failed to generate token",
			Code:    "INTERNAL_SERVER_ERROR",
			Error:   "Failed to generate token",
		}))
		return
	}

	// Set cookie with JWT
	cookieConfig := struct {
		Expiration time.Duration
		Domain     string
		Secure     bool
	}{
		Expiration: constants.AppConfig.DefaultJWTExpiration,
		Domain:     "",
		Secure:     true,
	}

	env := os.Getenv("ENV")
	if env == "" {
		c.JSON(http.StatusInternalServerError, utils.JR(utils.JsonResponse{
			Ok:      false,
			Message: "ENV is not set",
			Code:    "INTERNAL_SERVER_ERROR",
			Error:   "ENV is not set",
		}))
		return
	}

	if env == "production" {
		cookieConfig.Domain = constants.AppConfig.ProductionDomain
	}

	if env == "development" {
		cookieConfig.Domain = constants.AppConfig.DevelopmentDomain
		cookieConfig.Secure = false
	}

	c.SetCookie("jwt", jwtToken, int(cookieConfig.Expiration.Seconds()), "/", cookieConfig.Domain, cookieConfig.Secure, true)
	c.JSON(http.StatusOK, utils.JR(utils.JsonResponse{
		Ok:      true,
		Message: "Logged in successfully",
		Data: struct {
			SecurityQuestionsAnswered bool `json:"securityQuestionsAnswered"`
		}{
			SecurityQuestionsAnswered: user.SecurityQuestionsAnswered,
		},
	}))
}

package api

import (
	"net/http"
	"os"
	"time"

	"bus.zcauldron.com/pkg/constants"
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
	user, err := getUserFromDatabase(username)
	if err != nil || user == nil || bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)) != nil {
		c.JSON(http.StatusOK, gin.H{
			"ok":      false,
			"message": "Invalid username or password",
		})
		return
	}

	// Generate JWT after successful login
	jwtToken, err := utils.GenerateJWT(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"ok":      false,
			"message": "Failed to generate token",
		})
		return
	}

	// Set cookie with JWT
	var cookieConfig struct {
		Expiration time.Duration
		Domain     string
		Secure     bool
	}

	cookieConfig.Expiration = time.Minute * 10
	cookieConfig.Domain = constants.AppConfig.ProductionDomain
	cookieConfig.Secure = true

	env := os.Getenv("ENV")

	if env == "development" {
		cookieConfig.Domain = constants.AppConfig.DevelopmentDomain
		cookieConfig.Secure = false
	}

	c.SetCookie("jwt", jwtToken, int(cookieConfig.Expiration.Seconds()), "/", cookieConfig.Domain, cookieConfig.Secure, true)
	c.JSON(http.StatusOK, gin.H{
		"ok": true,
		// "token": jwtToken,
	})
}

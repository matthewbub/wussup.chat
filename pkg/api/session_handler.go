package api

import (
	"net/http"

	"bus.zcauldron.com/pkg/api/response"
	"bus.zcauldron.com/pkg/constants"
	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-gonic/gin"
)

func RenewSessionHandler(c *gin.Context) {
	tokenString, err := c.Cookie("jwt")
	if err != nil || tokenString == "" {
		c.JSON(http.StatusUnauthorized, response.Error(
			"Authentication failed",
			response.AUTHENTICATION_FAILED,
		))
		return
	}

	userID, _, err := utils.VerifyJWT(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, response.Error(
			"Invalid token",
			response.AUTHENTICATION_FAILED,
		))
		return
	}

	// Generate new token
	newToken, err := utils.GenerateJWT(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(
			"Failed to generate token",
			response.OPERATION_FAILED,
		))
		return
	}

	var domain string
	var env = utils.GetEnv()
	if env == "development" {
		domain = constants.AppConfig.DevelopmentDomain
	} else if env == "production" {
		domain = constants.AppConfig.ProductionDomain
	}

	if env == "test" {
		domain = constants.AppConfig.TestDomain
	}

	// Set new cookie
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(
		"jwt",
		newToken,
		int(constants.AppConfig.DefaultJWTExpiration.Seconds()),
		"/",
		domain,
		true,
		true,
	)

	c.JSON(http.StatusOK, response.SuccessMessage(
		"Session renewed successfully",
	))
}

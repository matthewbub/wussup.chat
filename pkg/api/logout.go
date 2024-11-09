package api

import (
	"net/http"
	"os"

	"bus.zcauldron.com/pkg/api/response"
	"bus.zcauldron.com/pkg/constants"
	"github.com/gin-gonic/gin"
)

func LogoutHandler(c *gin.Context) {
	env := os.Getenv("ENV")
	if env == "" {
		c.JSON(http.StatusInternalServerError, response.Error(
			"Server error",
			"ENV_NOT_SET",
		))
		return
	}

	domain := constants.AppConfig.ProductionDomain
	if env == "development" {
		domain = constants.AppConfig.DevelopmentDomain
	}

	// Clear the JWT cookie by setting an expired cookie
	c.SetCookie("jwt", "", -1, "/", domain, env == "production", true)

	c.JSON(http.StatusOK, response.SuccessMessage(
		"Logged out successfully",
	))
}

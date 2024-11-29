package api

import (
	"net/http"

	"bus.zcauldron.com/pkg/api/response"
	"bus.zcauldron.com/pkg/constants"
	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-gonic/gin"
)

func LogoutHandler(c *gin.Context) {
	env := utils.GetEnv()

	var domain string
	if env == "production" {
		domain = constants.AppConfig.ProductionDomain
	}
	if env == "development" {
		domain = constants.AppConfig.DevelopmentDomain
	}
	if env == "test" {
		domain = constants.AppConfig.TestDomain
	}

	// Clear the JWT cookie by setting an expired cookie
	c.SetCookie("jwt", "", -1, "/", domain, env == "production", true)

	c.JSON(http.StatusOK, response.SuccessMessage(
		"Logged out successfully",
	))
}

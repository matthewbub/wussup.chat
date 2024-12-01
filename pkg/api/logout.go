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
	if env == constants.ENV_PRODUCTION {
		domain = constants.AppConfig.ProductionDomain
	}

	if env == constants.ENV_STAGING {
		domain = constants.AppConfig.StagingDomain
	}

	if env == constants.ENV_DEVELOPMENT {
		domain = constants.AppConfig.DevelopmentDomain
	}

	if env == constants.ENV_TEST {
		domain = constants.AppConfig.TestDomain
	}

	// Clear the JWT cookie by setting an expired cookie
	c.SetCookie("jwt", "", -1, "/", domain, env == "production", true)

	c.JSON(http.StatusOK, response.SuccessMessage(
		"Logged out successfully",
	))
}

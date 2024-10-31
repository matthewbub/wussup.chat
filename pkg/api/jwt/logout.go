package jwt

import (
	"net/http"
	"os"

	"bus.zcauldron.com/pkg/constants"
	"github.com/gin-gonic/gin"
)

func Logout(c *gin.Context) {
	env := os.Getenv("ENV")

	domain := constants.AppConfig.ProductionDomain
	if env == "development" {
		domain = constants.AppConfig.DevelopmentDomain
	}

	c.SetCookie("jwt", "", 0, "/", domain, true, true)
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

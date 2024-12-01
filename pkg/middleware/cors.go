package middleware

import (
	"strconv"

	"bus.zcauldron.com/pkg/constants"
	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-gonic/gin"
)

func Cors(c *gin.Context) {
	env := utils.GetEnv()
	origin := c.Request.Header.Get("Origin")

	if env == "" {
		utils.GetLogger().Println("CORS: No environment found")
		c.AbortWithStatus(500)
		return
	}

	allowedOrigins := []string{}

	// do not assume prod by default
	if env == constants.ENV_PRODUCTION {
		allowedOrigins = append(allowedOrigins, "https://"+constants.AppConfig.ProductionDomain)
	}

	if env == constants.ENV_STAGING {
		allowedOrigins = append(allowedOrigins, "http://"+constants.AppConfig.StagingDomain+":"+strconv.Itoa(constants.AppConfig.DevelopmentPorts.Staging_Port))
	}

	if env == constants.ENV_DEVELOPMENT {
		allowedOrigins = append(allowedOrigins, "http://"+constants.AppConfig.DevelopmentDomain+":"+strconv.Itoa(constants.AppConfig.DevelopmentPorts.Frontend))
		allowedOrigins = append(allowedOrigins, "http://"+constants.AppConfig.DevelopmentDomain+":"+strconv.Itoa(constants.AppConfig.DevelopmentPorts.Backend))
	}

	if env == constants.ENV_TEST {
		allowedOrigins = append(allowedOrigins, "http://"+constants.AppConfig.TestDomain+":"+strconv.Itoa(constants.AppConfig.DevelopmentPorts.Frontend))
		allowedOrigins = append(allowedOrigins, "http://"+constants.AppConfig.TestDomain+":"+strconv.Itoa(constants.AppConfig.DevelopmentPorts.Backend))
	}

	if origin == "" || utils.ContainsOrigin(allowedOrigins, origin) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
	} else {
		utils.GetLogger().Println("CORS: Origin not allowed")
		c.AbortWithStatus(401)
		return
	}

	c.Next()
}

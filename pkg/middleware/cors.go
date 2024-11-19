package middleware

import (
	"log"
	"strconv"

	"bus.zcauldron.com/pkg/constants"
	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-gonic/gin"
)

func Cors(c *gin.Context) {
	env := utils.GetEnv()
	origin := c.Request.Header.Get("Origin")

	if env == "" {
		log.Println("CORS: No environment found")
		c.AbortWithStatus(500)
		return
	}

	allowedOrigins := []string{}

	// Do not assume prod by default
	if env == "production" {
		allowedOrigins = append(allowedOrigins, "https://"+constants.AppConfig.ProductionDomain)
	}

	if env == "development" {
		allowedOrigins = append(allowedOrigins, "http://"+constants.AppConfig.DevelopmentDomain+":"+strconv.Itoa(constants.AppConfig.DevelopmentPorts.Frontend))
		allowedOrigins = append(allowedOrigins, "http://"+constants.AppConfig.DevelopmentDomain+":"+strconv.Itoa(constants.AppConfig.DevelopmentPorts.Backend))
	} else if env == "test" {
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
		c.AbortWithStatus(401)
		return
	}

	c.Next()
}

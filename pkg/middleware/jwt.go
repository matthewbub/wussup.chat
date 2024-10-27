package middleware

import (
	"net/http"

	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-gonic/gin"
)

func JWTAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Token required"})
			c.Abort()
			return
		}

		userID, err := utils.VerifyJWT(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid token"})
			c.Abort()
			return
		}

		// Set user ID in the context for further use in the handlers
		c.Set("user_id", userID)
		c.Next()
	}
}

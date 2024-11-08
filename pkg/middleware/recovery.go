package middleware

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func Recovery(message string) gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// Log the error details
				log.Printf("Panic recovered: %v\n", err)

				// Optionally, you can redirect to a specific route
				c.Redirect(http.StatusFound, "/error")

				// Ensure that the rest of the handlers are not called
				c.Abort()
			}
		}()
		c.Next()
	}
}

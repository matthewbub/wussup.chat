package middleware

import (
	"log"

	"bus.zcauldron.com/pkg/views"
	"github.com/a-h/templ"
	"github.com/gin-gonic/gin"
)

func Recovery(message string) gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// Log the error details
				log.Printf("Panic recovered: %v\n", err)

				// Optionally, you can redirect to a specific route
				// c.Redirect(http.StatusFound, "/error")

				// Or render a specific template
				templ.Handler(views.GeneralError(views.GeneralErrorData{
					Title: "Error",
					// TODO why is this here
					IsLoggedIn: false,
					// TODO this was a test message
					Message: message,
				})).ServeHTTP(c.Writer, c.Request)

				// Ensure that the rest of the handlers are not called
				c.Abort()
			}
		}()
		c.Next()
	}
}

package handlers

import (
	"bus.zcauldron.com/pkg/views"
	"github.com/a-h/templ"
	"github.com/gin-gonic/gin"
)

func LandingView(c *gin.Context) {
	// TODO improve user auth behavior
	// If logged in, redirect to dashboard
	templ.Handler(views.Landing(views.LandingData{
		Title: "Landing",
		// TODO why is this here
		Name:       "World",
		IsLoggedIn: false,
		// TODO this was a test message
		Message: "Welcome to the login page",
	})).ServeHTTP(c.Writer, c.Request)
}

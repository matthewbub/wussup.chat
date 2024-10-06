package handlers

import (
	"bus.zcauldron.com/pkg/views"
	"github.com/a-h/templ"
	"github.com/gin-gonic/gin"
)

func LoginView(c *gin.Context) {
	// TODO improve user auth behavior
	// If logged in, redirect to dashboard
	templ.Handler(views.LogIn(views.LogInData{
		Title:      "Login",
		Name:       "World",
		IsLoggedIn: false,
		Message:    "Welcome to the login page",
	})).ServeHTTP(c.Writer, c.Request)
}

package handlers

import (
	"bus.zcauldron.com/pkg/views"
	"github.com/a-h/templ"
	"github.com/gin-gonic/gin"
)

func SignUpView(c *gin.Context) {
	// TODO improve user auth behavior
	// If logged in, redirect to dashboard
	templ.Handler(views.SignUp(views.SignUpData{
		Title:        "Sign Up",
		Name:         "",
		IsLoggedIn:   false,
		ErrorMessage: "",
	})).ServeHTTP(c.Writer, c.Request)
}

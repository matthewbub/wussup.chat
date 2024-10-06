package handlers

import (
	"bus.zcauldron.com/pkg/views"
	"github.com/a-h/templ"
	"github.com/gin-gonic/gin"
)

func ForgotPasswordView(c *gin.Context) {
	templ.Handler(views.ForgotPassword(views.ForgotPasswordData{
		Title:      "Forgot Password",
		Name:       "World",
		IsLoggedIn: false,
		Message:    "Welcome to the forgot password page",
	})).ServeHTTP(c.Writer, c.Request)
}

package handlers

import (
	"bus.zcauldron.com/pkg/views"
	"github.com/a-h/templ"
	"github.com/gin-gonic/gin"
)

func SignUpSuccessView(c *gin.Context) {
	templ.Handler(views.Success(views.SuccessData{
		Title:              "Success",
		Message:            "You have successfully signed up. You'll be redirected to your dashboard soon.",
		RedirectButtonText: "Or click here to go to your dashboard now.",
		Redirect:           "/dashboard",
	})).ServeHTTP(c.Writer, c.Request)
}

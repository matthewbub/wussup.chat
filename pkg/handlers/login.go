package handlers

import (
	"net/http"

	"bus.zcauldron.com/pkg/utils"
	"bus.zcauldron.com/pkg/views"
	"github.com/a-h/templ"
	"github.com/gin-gonic/gin"
)

func LoginView(c *gin.Context) {
	session := utils.GetSession(c)
	userID := session.Get("user_id")
	if userID != nil {
		c.Redirect(http.StatusSeeOther, "/dashboard")
		return
	}

	templ.Handler(views.LogIn(views.LogInData{
		Title:      "Login",
		IsLoggedIn: false,
	})).ServeHTTP(c.Writer, c.Request)
}

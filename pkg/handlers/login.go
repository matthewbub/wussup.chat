package handlers

import (
	"log"
	"net/http"

	"bus.zcauldron.com/pkg/utils"
	"bus.zcauldron.com/pkg/views"
	"github.com/a-h/templ"
	"github.com/gin-gonic/gin"
)

func LoginView(c *gin.Context) {
	user, err := utils.GetUserFromSession(c)
	if err != nil {
		log.Println("Error getting user from session:", err)
	}
	if user != nil {
		c.Redirect(http.StatusSeeOther, "/dashboard")
		return
	}

	templ.Handler(views.LogIn(views.LogInData{
		Title:      "Login",
		IsLoggedIn: false,
	})).ServeHTTP(c.Writer, c.Request)
}

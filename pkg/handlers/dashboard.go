package handlers

import (
	"log"
	"net/http"

	"bus.zcauldron.com/pkg/views"
	"bus.zcauldron.com/utils"
	"github.com/a-h/templ"
	"github.com/gin-gonic/gin"
)

func DashboardView(c *gin.Context) {
	user, err := utils.GetUserFromSession(c)
	if err != nil {
		log.Println(err)
		c.Redirect(http.StatusSeeOther, "/login")
		return
	}

	templ.Handler(views.Dashboard(views.DashboardData{
		Title:      "Dashboard",
		Name:       user.Username,
		IsLoggedIn: true,
		Message:    "Welcome to the dashboard",
	})).ServeHTTP(c.Writer, c.Request)
}

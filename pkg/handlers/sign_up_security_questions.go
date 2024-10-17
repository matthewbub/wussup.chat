package handlers

import (
	"log"
	"net/http"

	"bus.zcauldron.com/pkg/utils"
	"bus.zcauldron.com/pkg/views"
	"github.com/a-h/templ"
	"github.com/gin-gonic/gin"
)

func SignUpSecurityQuestionsView(c *gin.Context) {
	// if user already has security questions answered, dont show this page
	user, err := utils.GetUserFromSession(c)
	if err != nil {
		log.Println(err)
		templ.Handler(views.ErrorPage(views.ErrorPageData{
			Title:      "Error",
			IsLoggedIn: false,
		})).ServeHTTP(c.Writer, c.Request)
		return
	}

	if user.SecurityQuestionsAnswered {
		log.Println("User already has security questions answered")

		c.Redirect(http.StatusSeeOther, "/dashboard")
		c.Abort()
		return
	}

	templ.Handler(views.SecurityQuestions(views.SecurityQuestionsData{
		Title:   "Security Questions",
		Message: "Please answer the following security questions",
	})).ServeHTTP(c.Writer, c.Request)
}

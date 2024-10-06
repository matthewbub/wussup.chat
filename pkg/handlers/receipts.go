package handlers

import (
	"log"
	"net/http"

	"bus.zcauldron.com/models"
	"bus.zcauldron.com/pkg/views"
	"bus.zcauldron.com/utils"
	"github.com/a-h/templ"
	"github.com/gin-gonic/gin"
)

func ReceiptsView(c *gin.Context) {
	user, err := utils.GetUserFromSession(c)
	if err != nil {
		log.Println(err)
		c.Redirect(http.StatusSeeOther, "/login")
		return
	}

	receipts, err := models.GetReceipts(user.ID)
	if err != nil {
		log.Println(err)
		// TODO improve error handling
		c.Redirect(http.StatusSeeOther, "/dashboard")
		return
	}

	templ.Handler(views.Receipts(views.ReceiptsData{
		Title:      "Receipts",
		IsLoggedIn: true,
		Receipts:   receipts,
	})).ServeHTTP(c.Writer, c.Request)
}

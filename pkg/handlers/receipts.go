package handlers

import (
	"log"
	"net/http"

	"bus.zcauldron.com/pkg/utils"
	"bus.zcauldron.com/pkg/views"
	"github.com/a-h/templ"
	"github.com/gin-gonic/gin"
)

func ReceiptsView(c *gin.Context) {
	_, err := utils.GetUserFromSession(c)
	if err != nil {
		log.Println(err)
		c.Redirect(http.StatusSeeOther, "/login")
		return
	}

	templ.Handler(views.ReceiptUploadForm(views.ReceiptUploadFormData{
		Title:      "Upload Receipts",
		IsLoggedIn: true,
	})).ServeHTTP(c.Writer, c.Request)
}

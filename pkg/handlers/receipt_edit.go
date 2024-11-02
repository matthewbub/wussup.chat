package handlers

import (
	"log"
	"net/http"

	"bus.zcauldron.com/pkg/operations"
	"bus.zcauldron.com/pkg/utils"
	"bus.zcauldron.com/pkg/views"
	"github.com/a-h/templ"
	"github.com/gin-gonic/gin"
)

func EditReceiptView(c *gin.Context) {
	_, err := utils.GetUserFromSession(c)
	if err != nil {
		log.Println(err)
		c.Redirect(http.StatusSeeOther, "/login")
		return
	}

	receiptID := c.Param("id")
	if receiptID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Receipt ID is required"})
		return
	}

	receipt, err := operations.GetReceiptById(receiptID)

	if err != nil {
		log.Println(err)
		return
	}

	templ.Handler(views.EditReceipt(views.EditReceiptData{
		Title:      "ZCauldron Receipt",
		IsLoggedIn: true,
		Receipt:    *receipt,
	})).ServeHTTP(c.Writer, c.Request)
}

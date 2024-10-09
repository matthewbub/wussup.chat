package handlers

import (
	"log"
	"net/http"

	"bus.zcauldron.com/pkg/models"
	"bus.zcauldron.com/pkg/utils"
	"bus.zcauldron.com/pkg/views"
	"github.com/a-h/templ"
	"github.com/gin-gonic/gin"
)

func ReceiptView(c *gin.Context) {
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

	receipt, err := models.GetReceiptById(receiptID)

	if err != nil {
		log.Println(err)
		return
	}

	templ.Handler(views.ReceiptView(views.ReceiptViewData{
		Title:      "ZCauldron Receipt",
		IsLoggedIn: true,
		Receipt:    *receipt,
	})).ServeHTTP(c.Writer, c.Request)
}

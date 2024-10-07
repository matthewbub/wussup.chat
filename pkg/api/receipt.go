package api

import (
	"net/http"

	"bus.zcauldron.com/pkg/models"
	"github.com/gin-gonic/gin"
)

func GetReceipt(c *gin.Context) {
	id := c.Param("id")

	receipt, err := models.GetReceiptById(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Receipt not found"})
		return
	}

	c.JSON(http.StatusOK, receipt)
}

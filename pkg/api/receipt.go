package api

import (
	"net/http"

	"bus.zcauldron.com/pkg/models"
	"bus.zcauldron.com/pkg/utils"
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

func DeleteReceipts(c *gin.Context) {
	var request struct {
		ReceiptIDs []string `json:"receipt_ids"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	user, err := utils.GetUserFromSession(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user from session"})
		return
	}

	// Validate receipt ownership
	validReceipts := []string{}
	for _, id := range request.ReceiptIDs {
		validated, err := models.ValidateReceiptOwnership(user.ID, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to validate receipt ownership"})
			return
		}
		if validated {
			validReceipts = append(validReceipts, id)
		}
	}

	if len(validReceipts) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No valid receipts found"})
		return
	}

	// Delete receipts
	err = models.DeleteReceipts(validReceipts, user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete receipts"})
		return
	}

	c.Set("Message", "Receipts deleted successfully")
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Receipts deleted successfully",
	})
}

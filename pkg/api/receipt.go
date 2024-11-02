package api

import (
	"fmt"
	"net/http"

	"bus.zcauldron.com/pkg/operations"
	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-gonic/gin"
)

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
	var validReceipts []string
	for _, id := range request.ReceiptIDs {
		validated, err := operations.ValidateReceiptOwnership(user.ID, id)
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
	err = operations.DeleteReceipts(validReceipts, user.ID)
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

func ExportReceipts(c *gin.Context) {
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
	var validReceipts []string
	for _, id := range request.ReceiptIDs {
		validated, err := operations.ValidateReceiptOwnership(user.ID, id)
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

	// Prepare csv
	//https://stackoverflow.com/questions/6076984/sqlite-how-do-i-save-the-result-of-a-query-as-a-csv-file
	rows, err := operations.SimpleGetReceipts(user.ID, validReceipts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get receipts"})
		return
	}

	csvData := "Date,Merchant,Total,Notes,ID,CreatedAt,UpdatedAt\n"
	for _, row := range rows {
		csvData += fmt.Sprintf("%s,%s,%s,%s,%s,%s,%s\n",
			row.Date,
			row.Merchant,
			utils.FormatCentsToUSD(row.Total),
			row.Notes.String,
			row.ID,
			row.CreatedAt.Format("01/02/2006"),
			row.UpdatedAt.Format("01/02/2006"),
		)
	}

	// Set headers for file download
	filename := "receipts.csv"
	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Disposition", "attachment; filename="+filename)
	c.Header("Content-Type", "text/csv")
	c.Header("Content-Transfer-Encoding", "binary")
	c.Header("Expires", "0")
	c.Header("Cache-Control", "must-revalidate")
	c.Header("Pragma", "public")

	// Write CSV data directly to the response
	c.String(http.StatusOK, csvData)
}

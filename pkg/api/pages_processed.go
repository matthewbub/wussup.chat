package api

import (
	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-gonic/gin"
)

func GetPagesProcessed(c *gin.Context) {
	logger := utils.GetLogger()

	tokenString, err := c.Cookie("jwt")
	if err != nil || tokenString == "" {
		logger.Printf("Unauthorized access attempt: missing or empty JWT")
		c.JSON(401, gin.H{"error": "Unauthorized"})
		return
	}

	userID, _, err := utils.VerifyJWT(tokenString)
	if err != nil {
		logger.Printf("JWT verification failed: %v", err)
		c.JSON(401, gin.H{"error": "Unauthorized"})
		return
	}

	db := utils.GetDB()
	rows, err := db.Query("SELECT pages_processed FROM pdf_processing WHERE user_id = ?", userID)
	if err != nil {
		logger.Printf("Failed to get pages processed: %v", err)
		c.JSON(500, gin.H{"error": "Failed to get pages processed"})
		return
	}

	defer rows.Close()

	var totalPagesProcessed int
	for rows.Next() {
		var currentPages int
		err := rows.Scan(&currentPages)
		if err != nil {
			logger.Printf("Failed to scan pages processed: %v", err)
			c.JSON(500, gin.H{"error": "Failed to scan pages processed"})
			return
		}
		totalPagesProcessed += currentPages
	}

	c.JSON(200, gin.H{"pages_processed": totalPagesProcessed})
}

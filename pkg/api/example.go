package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func ExampleAuthEndpoint(c *gin.Context) {
	// Retrieve the user_id from the JWT
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "User ID not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "JWT authenticated",
		"user_id": userID,
	})
}

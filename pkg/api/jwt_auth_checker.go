package api

import (
	"net/http"

	"bus.zcauldron.com/pkg/models"
	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-gonic/gin"
)

func JWTAuthCheckHandler(c *gin.Context) {
	// Retrieve the JWT from the cookie
	tokenString, err := c.Cookie("jwt")
	if err != nil || tokenString == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"ok":    false,
			"error": "Token required",
		})
		return
	}

	// Verify the JWT and get the user ID and expiration status
	userID, _, err := utils.VerifyJWT(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"ok":    false,
			"error": "Invalid token",
		})
		return
	}

	// Check if user exists in the database
	user, err := models.GetUserByID(userID)
	if err != nil || user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"ok":    false,
			"error": "User not found",
		})
		return
	}

	// If user exists and token is valid, return success response
	c.JSON(http.StatusOK, gin.H{
		"ok": true,
		"user": gin.H{
			"id":                        user.ID,
			"username":                  user.Username,
			"email":                     user.Email,
			"securityQuestionsAnswered": user.SecurityQuestionsAnswered,
		},
	})
}

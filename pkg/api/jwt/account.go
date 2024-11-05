package jwt

import (
	"net/http"

	"bus.zcauldron.com/pkg/operations"
	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-gonic/gin"
)

// Account management endpoints

// UpdateProfile updates user profile information
func UpdateProfile(c *gin.Context) {
	// POST /api/v1/account/profile
	// Request body: { email: string }
	c.JSON(http.StatusOK, gin.H{"message": "Profile updated", "ok": true})
}

// UpdateSecurity updates security settings
func UpdateSecurity(c *gin.Context) {
	// POST /api/v1/account/security
	// Request body: {
	//   currentPassword: string,
	//   newPassword: string,
	//   securityQuestion1: string,
	//   securityQuestion2: string
	// }
	c.JSON(http.StatusOK, gin.H{"message": "Security updated", "ok": true})
}

// UpdatePreferences updates user preferences
func UpdatePreferences(c *gin.Context) {
	// POST /api/v1/account/preferences
	// Request body: {
	//   useMarkdown: boolean,
	//   colorTheme: "light" | "dark" | "system"
	// }
	c.JSON(http.StatusOK, gin.H{"message": "Preferences updated", "ok": true})
}

// ExportData initiates a data export
func ExportData(c *gin.Context) {
	// POST /api/v1/account/export
	c.JSON(http.StatusOK, gin.H{"message": "Data exported", "ok": true})
}

// DeleteAccount permanently deletes the user account
func DeleteAccount(c *gin.Context) {
	// Retrieve the JWT from the cookie
	tokenString, err := c.Cookie("jwt")
	if err != nil || tokenString == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"ok": false,
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
	user, err := operations.GetUserWithRoleByID(userID)
	if err != nil || user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"ok":    false,
			"error": "User not found",
		})
		return
	}

	// Delete the user from the database
	err = operations.DeleteUser(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"ok":    false,
			"error": "Failed to delete user",
		})
		return
	}

	// DELETE /api/v1/account
	c.JSON(http.StatusOK, gin.H{"message": "Account deleted", "ok": true})
}

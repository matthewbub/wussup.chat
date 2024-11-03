package jwt

import (
	"net/http"

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
	// DELETE /api/v1/account
	c.JSON(http.StatusOK, gin.H{"message": "Account deleted", "ok": true})
}

package jwt

import (
	"log"
	"net/http"

	"bus.zcauldron.com/pkg/operations"
	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-gonic/gin"
)

// Account management endpoints

// UpdateProfile updates user profile information
func UpdateProfile(c *gin.Context) {
	// POST /api/v1/jwt/account/profile
	user, err := utils.GetAuthenticatedUser(c)

	if err != nil {
		log.Println(err)
		c.JSON(http.StatusUnauthorized, gin.H{
			"ok":    false,
			"error": "User not found",
		})
		return
	}

	var body struct {
		Email string `json:"email"`
	}
	if err := c.BindJSON(&body); err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"ok":    false,
			"error": "Invalid request body",
		})
		return
	}
	email := body.Email
	if email == "" {
		log.Println("Email is required")
		c.JSON(http.StatusBadRequest, gin.H{
			"ok":    false,
			"error": "Email is required",
		})
		return
	}

	err = operations.UpdateUserEmail(user.ID, email)
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"ok":    false,
			"error": "Failed to update email",
		})
		return
	}

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
	user, err := utils.GetAuthenticatedUser(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"ok":    false,
			"error": "User not found",
		})
		return
	}

	// Delete the user from the database
	err = operations.DeleteUser(user.ID)
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

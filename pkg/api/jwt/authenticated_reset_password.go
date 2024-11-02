package jwt

import (
	"log"
	"net/http"

	"bus.zcauldron.com/pkg/operations"
	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// ResetPasswordHandler This is specifically for the users that are currently logged in
func ResetPasswordHandler(c *gin.Context) {
	// Retrieve JWT token from cookies
	tokenString, err := c.Cookie("jwt")
	if err != nil || tokenString == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"ok": false, "message": "User not authenticated"})
		return
	}

	// Verify the JWT and extract user ID
	userID, _, err := utils.VerifyJWT(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"ok": false, "message": "Invalid token"})
		return
	}

	// Parse request body
	var body struct {
		OldPassword        string `json:"oldPassword"`
		NewPassword        string `json:"newPassword"`
		ConfirmNewPassword string `json:"confirmNewPassword"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"ok": false, "message": "Invalid request data"})
		return
	}

	if body.NewPassword != body.ConfirmNewPassword {
		log.Printf("Passwords do not match %s != %s", body.NewPassword, body.ConfirmNewPassword)
		c.JSON(http.StatusBadRequest, gin.H{"ok": false, "message": "Passwords do not match"})
		return
	}

	// Validate new password strength
	if err := validatePassword(body.NewPassword); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"ok": false, "message": err.Error()})
		return
	}

	// Retrieve the user from the database
	user, err := operations.GetUserWithPasswordByID(userID)
	if err != nil || user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"ok": false, "message": "User not found"})
		return
	}

	// Verify old password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.OldPassword)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"ok": false, "message": "Old password is incorrect"})
		return
	}

	// Hash the new password
	newPasswordHash, err := utils.HashPassword(body.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "message": "Error updating password"})
		return
	}

	// Update the user's password in the database
	if err := operations.UpdateUserPassword(userID, string(newPasswordHash)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "message": "Error saving new password"})
		return
	}

	// Optionally, re-issue a JWT for the user with an updated expiration time
	_, err = utils.GenerateJWT(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "message": "Failed to generate new token"})
		return
	}

	// Set new JWT token in the cookie
	//c.SetCookie("jwt", newToken, int(time.Hour*24*7.Seconds()), "/", constants.AppConfig.ProductionDomain, true, true)
	c.JSON(http.StatusOK, gin.H{"ok": true, "message": "Password reset successfully"})
}

package api

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-gonic/gin"
)

// Account management endpoints

// UpdateProfile updates user profile information
func UpdateProfileHandler(c *gin.Context) {
	// POST /api/v1/account/profile
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

	err = updateUserEmail(user.ID, email)
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

func updateUserEmail(userID, email string) error {
	db := utils.Db()
	defer db.Close()

	if email == "" || !strings.Contains(email, "@") || len(email) > 255 {
		return fmt.Errorf("invalid email")
	}

	// Check if email is already in use by another user
	var existingUserID string
	stmt, err := db.Prepare("SELECT id FROM users WHERE email = ? AND id != ?")
	if err != nil {
		log.Println(err)
		return err
	}
	err = stmt.QueryRow(email, userID).Scan(&existingUserID)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		log.Println(err)
		return err
	}
	if existingUserID != "" {
		return fmt.Errorf("email already in use")
	}

	stmt, err = db.Prepare("UPDATE users SET email = ?, updated_at = ? WHERE id = ?")
	if err != nil {
		log.Println(err)
		return err
	}

	_, err = stmt.Exec(email, time.Now().Format(time.RFC3339), userID)
	if err != nil {
		log.Println(err)
		return err
	}

	return nil
}

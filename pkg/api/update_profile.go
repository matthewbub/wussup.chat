package api

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/mail"
	"time"

	"bus.zcauldron.com/pkg/api/response"
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
		c.JSON(http.StatusUnauthorized, response.Error(
			"User not found",
			response.AUTHENTICATION_FAILED,
		))
		return
	}

	var body struct {
		Email string `json:"email"`
	}
	if err := c.BindJSON(&body); err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest, response.Error(
			"Invalid request body",
			response.INVALID_REQUEST_DATA,
		))
		return
	}
	email := body.Email
	if email == "" {
		log.Println("Email is required")
		c.JSON(http.StatusBadRequest, response.Error(
			"Email is required",
			response.INVALID_REQUEST_DATA,
		))
		return
	}

	err = updateUserEmail(user.ID, email)
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusInternalServerError, response.Error(
			"Failed to update email",
			response.OPERATION_FAILED,
		))
		return
	}

	c.JSON(http.StatusOK, response.SuccessMessage(
		"Profile updated",
	))
}

func updateUserEmail(userID, email string) error {
	db := utils.GetDB()

	// Input validation
	if email == "" || len(email) > 255 {
		return fmt.Errorf("invalid email: empty or too long")
	}
	if _, err := mail.ParseAddress(email); err != nil {
		return fmt.Errorf("invalid email: %w", err)
	}

	// Start transaction
	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback() // Rollback if not committed

	// Check if email is already in use by another user
	var existingUserID string
	stmt, err := tx.Prepare("SELECT id FROM users WHERE email = ? AND id != ?")
	if err != nil {
		return fmt.Errorf("failed to prepare select statement: %w", err)
	}
	err = stmt.QueryRow(email, userID).Scan(&existingUserID)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return fmt.Errorf("failed to check existing email: %w", err)
	}
	if existingUserID != "" {
		return fmt.Errorf("email already in use")
	}

	// Update the email
	stmt, err = tx.Prepare("UPDATE users SET email = ?, updated_at = ? WHERE id = ?")
	if err != nil {
		return fmt.Errorf("failed to prepare update statement: %w", err)
	}
	_, err = stmt.Exec(email, time.Now().Format(time.RFC3339), userID)
	if err != nil {
		return fmt.Errorf("failed to update email: %w", err)
	}

	// Commit the transaction
	if err = tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

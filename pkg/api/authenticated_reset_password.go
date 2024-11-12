package api

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"net/http"

	"bus.zcauldron.com/pkg/api/response"
	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// AuthenticatedResetPasswordHandler This is specifically for the users that are currently logged in
func AuthenticatedResetPasswordHandler(c *gin.Context) {
	// Retrieve JWT token from cookies
	tokenString, err := c.Cookie("jwt")
	if err != nil || tokenString == "" {
		c.JSON(http.StatusUnauthorized, response.Error(
			"User not authenticated",
			response.AUTHENTICATION_FAILED,
		))
		return
	}

	// Verify the JWT and extract user ID
	userID, _, err := utils.VerifyJWT(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, response.Error(
			"Invalid token",
			response.AUTHENTICATION_FAILED,
		))
		return
	}

	// Parse request body
	var body struct {
		OldPassword        string `json:"oldPassword"`
		NewPassword        string `json:"newPassword"`
		ConfirmNewPassword string `json:"confirmNewPassword"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, response.Error(
			"Invalid request data",
			response.INVALID_REQUEST_DATA,
		))
		return
	}

	if body.NewPassword != body.ConfirmNewPassword {
		c.JSON(http.StatusBadRequest, response.Error(
			"Passwords do not match",
			response.INVALID_REQUEST_DATA,
		))
		return
	}

	// Validate new password strength
	if err := utils.ValidatePasswordStrength(body.NewPassword); err != nil {
		c.JSON(http.StatusBadRequest, response.Error(
			"Weak password",
			response.WEAK_PASSWORD,
		))
		return
	}

	// Retrieve the user from the database
	user, err := getUserForAuthenticatedResetPassword(userID)
	if err != nil || user == nil {
		c.JSON(http.StatusUnauthorized, response.Error(
			"User not found",
			response.AUTHENTICATION_FAILED,
		))
		return
	}

	// Verify old password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.OldPassword)); err != nil {
		c.JSON(http.StatusUnauthorized, response.Error(
			"Old password is incorrect",
			response.AUTHENTICATION_FAILED,
		))
		return
	}

	// Hash the new password
	newPasswordHash, err := utils.HashPassword(body.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(
			"Error updating password",
			response.OPERATION_FAILED,
		))
		return
	}

	// Update the user's password
	if err := updateUserPasswordForAuthenticatedResetPassword(userID, newPasswordHash); err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(
			"Error saving new password",
			response.OPERATION_FAILED,
		))
		return
	}

	c.JSON(http.StatusOK, response.SuccessMessage("Password reset successfully"))
}

func getUserForAuthenticatedResetPassword(userID string) (*utils.UserWithRole, error) {
	db := utils.GetDB()

	user := utils.UserWithRole{}
	stmt, err := db.Prepare("SELECT id, username, email, security_questions_answered, password, application_environment_role FROM active_users WHERE id = ?")
	if err != nil {
		log.Println(err)
		return nil, err
	}
	defer stmt.Close()

	err = stmt.QueryRow(userID).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.SecurityQuestionsAnswered,
		&user.Password,
		&user.ApplicationEnvironmentRole,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("user not found")
		}
		log.Println(err)
		return nil, err
	}

	return &user, nil
}

func updateUserPasswordForAuthenticatedResetPassword(userID, hashedPassword string) error {
	db := utils.GetDB()

	tx, err := db.Begin()
	if err != nil {
		log.Println(err)
		return err
	}
	defer tx.Rollback()

	// user cant reuse passwords
	stmt, err := tx.Prepare("SELECT COUNT(*) FROM password_history WHERE user_id = ? AND password = ?")
	if err != nil {
		log.Println(err)
		return err
	}

	var count int
	err = stmt.QueryRow(userID, hashedPassword).Scan(&count)
	if err != nil {
		log.Println(err)
		return err
	}

	if count > 0 {
		return fmt.Errorf("password cannot be reused")
	}

	stmt.Close()

	// Update the user's password
	stmt, err = tx.Prepare("UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
	if err != nil {
		log.Println(err)
		return err
	}

	_, err = stmt.Exec(hashedPassword, userID)
	if err != nil {
		log.Println(err)
		return err
	}

	stmt.Close()

	// Insert the password into the password history
	stmt, err = tx.Prepare("INSERT INTO password_history (user_id, password) VALUES (?, ?)")
	if err != nil {
		log.Println(err)
		return err
	}

	_, err = stmt.Exec(userID, hashedPassword)
	if err != nil {
		log.Println(err)
		return err
	}

	if err = tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

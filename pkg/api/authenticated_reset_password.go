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
			"UNAUTHORIZED",
		))
		return
	}

	// Verify the JWT and extract user ID
	userID, _, err := utils.VerifyJWT(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, response.Error(
			"Invalid token",
			"INVALID_TOKEN",
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
			"INVALID_REQUEST_DATA",
		))
		return
	}

	if body.NewPassword != body.ConfirmNewPassword {
		c.JSON(http.StatusBadRequest, response.Error(
			"Passwords do not match",
			"PASSWORD_MISMATCH",
		))
		return
	}

	// Validate new password strength
	if err := utils.ValidatePasswordStrength(body.NewPassword); err != nil {
		c.JSON(http.StatusBadRequest, response.Error(
			"Weak password",
			"WEAK_PASSWORD",
		))
		return
	}

	// Retrieve the user from the database
	user, err := getUserForAuthenticatedResetPassword(userID)
	if err != nil || user == nil {
		c.JSON(http.StatusUnauthorized, response.Error(
			"User not found",
			"USER_NOT_FOUND",
		))
		return
	}

	// Verify old password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.OldPassword)); err != nil {
		c.JSON(http.StatusUnauthorized, response.Error(
			"Old password is incorrect",
			"INVALID_PASSWORD",
		))
		return
	}

	// Hash the new password
	newPasswordHash, err := utils.HashPassword(body.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(
			"Error updating password",
			"PASSWORD_HASH_ERROR",
		))
		return
	}

	// Update the user's password
	if err := updateUserPasswordForAuthenticatedResetPassword(userID, newPasswordHash); err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(
			"Error saving new password",
			"DATABASE_ERROR",
		))
		return
	}

	c.JSON(http.StatusOK, response.SuccessMessage("Password reset successfully"))
}

func getUserForAuthenticatedResetPassword(userID string) (*utils.UserWithRole, error) {
	db := utils.Db()
	defer db.Close()

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
	db := utils.Db()
	defer db.Close()

	stmt, err := db.Prepare("UPDATE active_users SET password = ? WHERE id = ?")
	if err != nil {
		log.Println(err)
		return err
	}

	_, err = stmt.Exec(hashedPassword, userID)
	if err != nil {
		log.Println(err)
		return err
	}

	// Insert the password into the password history
	stmt, err = db.Prepare("INSERT INTO password_history (user_id, password) VALUES (?, ?)")
	if err != nil {
		log.Println(err)
		return err
	}

	_, err = stmt.Exec(userID, hashedPassword)
	if err != nil {
		log.Println(err)
		return err
	}

	return nil
}

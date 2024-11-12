package api

import (
	"fmt"
	"net/http"
	"time"

	"bus.zcauldron.com/pkg/api/response"
	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-gonic/gin"
)

// DeleteAccountHandler permanently deletes the user account
func DeleteAccountHandler(c *gin.Context) {
	user, err := utils.GetAuthenticatedUser(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, response.Error(
			"Authentication failed",
			response.AUTHENTICATION_FAILED,
		))
		return
	}

	err = deleteUser(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(
			"Operation failed",
			response.OPERATION_FAILED,
		))
		return
	}

	c.JSON(http.StatusOK, response.SuccessMessage(
		"Account deleted successfully",
	))
}

func deleteUser(userID string) error {
	db := utils.GetDB()

	stmt, err := db.Prepare("UPDATE users SET inactive_at = ?, updated_at = ? WHERE id = ?")
	if err != nil {
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	_, err = stmt.Exec(time.Now(), time.Now(), userID)
	if err != nil {
		return fmt.Errorf("failed to execute statement: %w", err)
	}

	return nil
}

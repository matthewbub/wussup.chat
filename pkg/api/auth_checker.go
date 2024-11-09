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
)

func AuthCheckHandler(c *gin.Context) {
	tokenString, err := c.Cookie("jwt")
	if err != nil || tokenString == "" {
		c.JSON(http.StatusUnauthorized, response.Error(
			"Unauthorized",
			"UNAUTHORIZED",
		))
		return
	}

	userID, _, err := utils.VerifyJWT(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, response.Error(
			"Invalid token",
			"INVALID_TOKEN",
		))
		return
	}

	user, err := getUserForAuthChecker(userID)
	if err != nil || user == nil {
		c.JSON(http.StatusUnauthorized, response.Error(
			"User not found",
			"USER_NOT_FOUND",
		))
		return
	}

	if user.InactiveAt.Valid {
		c.JSON(http.StatusUnauthorized, response.Error(
			"User is inactive",
			"USER_INACTIVE",
		))
		return
	}

	c.JSON(http.StatusOK, response.Success(
		gin.H{
			"user": gin.H{
				"id":                         user.ID,
				"username":                   user.Username,
				"email":                      user.Email,
				"securityQuestionsAnswered":  user.SecurityQuestionsAnswered,
				"applicationEnvironmentRole": user.ApplicationEnvironmentRole,
				"inactiveAt":                 user.InactiveAt,
			},
		},
		"Authentication successful",
	))
}

func getUserForAuthChecker(userID string) (*utils.UserWithRole, error) {
	db := utils.Db()
	defer db.Close()

	user := utils.UserWithRole{}
	stmt, err := db.Prepare("SELECT id, username, email, security_questions_answered, application_environment_role, password, inactive_at FROM active_users WHERE id = ?")
	if err != nil {
		return nil, fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	err = stmt.QueryRow(userID).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.SecurityQuestionsAnswered,
		&user.ApplicationEnvironmentRole,
		&user.Password,
		&user.InactiveAt,
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

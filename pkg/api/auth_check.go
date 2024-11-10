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

	userData := UserForAuthCheck{
		ID:                         user.ID,
		Username:                   user.Username,
		Email:                      user.Email,
		SecurityQuestionsAnswered:  user.SecurityQuestionsAnswered,
		ApplicationEnvironmentRole: user.ApplicationEnvironmentRole,
		InactiveAt:                 user.InactiveAt,
	}

	resp := response.New[UserForAuthCheck]()
	resp.WithData(userData).
		WithMessage("Authentication successful")

	c.Header("Link", "</api/v1/schema/auth_check>; rel=describedby")
	c.JSON(http.StatusOK, resp.ToGinH())
}

func getUserForAuthChecker(userID string) (*UserForAuthCheck, error) {
	db := utils.GetDB()

	user := UserForAuthCheck{}
	stmt, err := db.Prepare("SELECT id, username, email, security_questions_answered, application_environment_role, inactive_at FROM active_users WHERE id = ?")
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

type AuthCheckResponse struct {
	response.Response[UserForAuthCheck]
}

type UserForAuthCheck struct {
	ID                         string       `json:"id"`
	Username                   string       `json:"username"`
	Email                      string       `json:"email"`
	SecurityQuestionsAnswered  bool         `json:"securityQuestionsAnswered"`
	ApplicationEnvironmentRole string       `json:"applicationEnvironmentRole"`
	InactiveAt                 sql.NullTime `json:"inactiveAt"`
}

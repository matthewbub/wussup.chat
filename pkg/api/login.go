package api

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"bus.zcauldron.com/pkg/api/response"
	"bus.zcauldron.com/pkg/constants"
	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func LoginHandler(c *gin.Context) {
	var body struct {
		Username   string `json:"username"`
		Password   string `json:"password"`
		RememberMe bool   `json:"rememberMe"`
	}
	err := c.BindJSON(&body)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.Error(
			"Invalid request body",
			"INVALID_REQUEST_BODY",
		))
		return
	}
	username := utils.SanitizeInput(body.Username)
	password := utils.SanitizeInput(body.Password)
	user, err := getUserForLogin(username)

	// Basic validation
	if err != nil || user == nil || bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)) != nil {
		c.JSON(http.StatusUnauthorized, response.Error(
			"Invalid username or password",
			"INVALID_REQUEST_DATA",
		))
		return
	}

	// Check if user is inactive
	if user.InactiveAt.Valid {
		log.Println("User is inactive", user.ID)
		c.JSON(http.StatusUnauthorized, response.Error(
			"User is inactive",
			"INVALID_REQUEST_DATA",
		))
		return
	}

	// Generate JWT after successful login
	jwtToken, err := utils.GenerateJWT(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(
			"Failed to generate token",
			"FAILED_TO_GENERATE_TOKEN",
		))
		return
	}

	// Set cookie with JWT
	cookieConfig := struct {
		Expiration time.Duration
		Domain     string
		Secure     bool
	}{
		Expiration: constants.AppConfig.DefaultJWTExpiration,
		Domain:     "",
		Secure:     true,
	}

	env := os.Getenv("ENV")
	if env == "" {
		c.JSON(http.StatusInternalServerError, response.Error(
			"ENV is not set",
			"ENV_NOT_SET",
		))
		return
	}

	if env == "production" {
		cookieConfig.Domain = constants.AppConfig.ProductionDomain
	}

	if env == "development" {
		cookieConfig.Domain = constants.AppConfig.DevelopmentDomain
		cookieConfig.Secure = false
	}

	c.SetCookie("jwt", jwtToken, int(cookieConfig.Expiration.Seconds()), "/", cookieConfig.Domain, cookieConfig.Secure, true)
	c.JSON(http.StatusOK, response.Success(
		struct {
			SecurityQuestionsAnswered bool `json:"securityQuestionsAnswered"`
		}{
			SecurityQuestionsAnswered: user.SecurityQuestionsAnswered,
		},
		"Logged in successfully",
	))
}

func getUserForLogin(username string) (*utils.UserWithRole, error) {
	db := utils.Db()
	defer db.Close()

	user := utils.UserWithRole{}
	stmt, err := db.Prepare("SELECT id, username, email, security_questions_answered, password, inactive_at FROM active_users WHERE username = ?")
	if err != nil {
		log.Println(err)
		return nil, err
	}
	defer stmt.Close()

	err = stmt.QueryRow(username).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.SecurityQuestionsAnswered,
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

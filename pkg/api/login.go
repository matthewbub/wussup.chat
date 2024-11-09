package api

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

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
		return
	}
	username := utils.SanitizeInput(body.Username)
	password := utils.SanitizeInput(body.Password)

	user, err := getUserForLogin(username)

	// Basic validation
	if err != nil || user == nil || bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)) != nil {
		c.JSON(http.StatusUnauthorized, utils.JR(utils.JsonResponse{
			Ok:      false,
			Message: "Invalid username or password",
			Code:    "INVALID_REQUEST_DATA",
			Error:   "Invalid username or password",
		}))
		return
	}

	// Check if user is inactive
	if user.InactiveAt.Valid {
		log.Println("User is inactive", user.ID)
		c.JSON(http.StatusUnauthorized, utils.JR(utils.JsonResponse{
			Ok:      false,
			Message: "Invalid username or password",
			Code:    "INVALID_REQUEST_DATA",
			Error:   "User is inactive",
		}))
		return
	}

	// Generate JWT after successful login
	jwtToken, err := utils.GenerateJWT(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.JR(utils.JsonResponse{
			Ok:      false,
			Message: "Failed to generate token",
			Code:    "FAILED_TO_GENERATE_TOKEN",
			Error:   "Failed to generate token",
		}))
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
		c.JSON(http.StatusInternalServerError, utils.JR(utils.JsonResponse{
			Ok:      false,
			Message: "ENV is not set",
			Code:    "ENV_NOT_SET",
			Error:   "ENV is not set",
		}))
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
	c.JSON(http.StatusOK, utils.JR(utils.JsonResponse{
		Ok:      true,
		Message: "Logged in successfully",
		Data: struct {
			SecurityQuestionsAnswered bool `json:"securityQuestionsAnswered"`
		}{
			SecurityQuestionsAnswered: user.SecurityQuestionsAnswered,
		},
	}))
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

package api

import (
	"encoding/json"
	"net/http"

	"golang.org/x/crypto/bcrypt"

	"bus.zcauldron.com/pkg/models"
	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

func LoginHandler(c *gin.Context) {
	var body struct {
		Username string `json:"username"`
		Password string `json:"password"`
		Remember bool   `json:"remember"`
	}
	if err := json.NewDecoder(c.Request.Body).Decode(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request body"})
		return
	}
	username := utils.SanitizeInput(body.Username)
	password := utils.SanitizeInput(body.Password)
	rememberMe := body.Remember

	if username == "" || password == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid username or password"})
		return
	}

	user, err := models.ValidateUserForLogin(username)
	if err != nil || user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid username or password"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid username or password"})
		return
	}

	session := utils.GetSession(c)
	setSessionData(session, user, rememberMe)
	if err := session.Save(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Internal server error"})
		return
	}

	token, err := utils.GenerateJWT(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Internal server error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"ok":    true,
		"token": token,
	})
}

func setSessionData(session sessions.Session, user *models.UserForValidation, rememberMe bool) {
	if user.ID != "" {
		session.Set("user_id", user.ID)
	}
	if user.Username != "" {
		session.Set("username", user.Username)
	}
	if user.Email != "" {
		session.Set("email", user.Email)
	}

	if rememberMe {
		session.Options(sessions.Options{
			MaxAge: 30 * 24 * 60 * 60, // 30 days in seconds
		})
	}

	session.Options(sessions.Options{
		HttpOnly: true,                    // Prevents JavaScript from accessing cookies
		Secure:   true,                    // Ensures cookies are only sent over HTTPS
		SameSite: http.SameSiteStrictMode, // Prevents CSRF attacks
	})
}

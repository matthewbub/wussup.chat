package api

import (
	"log"
	"net/http"

	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func LoginWithJWTHandler(c *gin.Context) {
	var body struct {
		Username   string `json:"username"`
		Password   string `json:"password"`
		RememberMe bool   `json:"rememberMe"`
	}
	c.BindJSON(&body)
	username := utils.SanitizeInput(body.Username)
	password := utils.SanitizeInput(body.Password)
	rememberMe := body.RememberMe

	log.Println("LoginWithJWTHandler", username, password, rememberMe)

	// Existing user validation logic
	user, err := getUserFromDatabase(username)
	if err != nil || user == nil || bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)) != nil {
		log.Println("Invalid username or password", username, password)
		log.Println(err)
		log.Println(user)
		c.JSON(http.StatusOK, gin.H{
			"ok":      false,
			"message": "Invalid username or password",
		})
		return
	}

	// Generate JWT after successful login
	jwtToken, err := utils.GenerateJWT(user.ID, rememberMe)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"ok":      false,
			"message": "Failed to generate token",
		})
		return
	}

	// Return the JWT in the response
	c.JSON(http.StatusOK, gin.H{
		"ok":    true,
		"token": jwtToken,
	})
}

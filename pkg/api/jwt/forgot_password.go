package jwt

import (
	"log"
	"net/http"

	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-gonic/gin"
)

func ForgotPasswordHandler(c *gin.Context) {
	var body struct {
		Username string `json:"username"`
	}

	err := c.BindJSON(&body)
	if err != nil {
		log.Print("Something went wrong binding the JSON")
		c.JSON(http.StatusOK, gin.H{
			"ok": false,
		})
	}

	username := utils.SanitizeInput(body.Username)

	log.Println(username)

	c.JSON(http.StatusOK, gin.H{
		"ok": true,
	})
}

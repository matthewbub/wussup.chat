package api

import (
	"log"
	"net/http"

	"bus.zcauldron.com/pkg/api/response"
	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-gonic/gin"
)

func ForgotPasswordHandler(c *gin.Context) {
	var body struct {
		Username string `json:"username"`
	}

	err := c.BindJSON(&body)
	if err != nil {
		c.JSON(http.StatusOK, response.Error(
			"Something went wrong binding the JSON",
			response.INVALID_REQUEST_DATA,
		))
	}

	username := utils.SanitizeInput(body.Username)

	log.Println(username)

	c.JSON(http.StatusOK, response.SuccessMessage(
		"ok",
	))
}

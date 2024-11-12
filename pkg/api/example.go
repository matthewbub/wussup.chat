package api

import (
	"log"
	"net/http"

	"bus.zcauldron.com/pkg/api/response"
	"github.com/gin-gonic/gin"
)

func ExampleAuthEndpoint(c *gin.Context) {
	log.Println("example auth endpoint hit")

	c.JSON(http.StatusOK, response.SuccessMessage(
		"JWT authenticated",
	))
}

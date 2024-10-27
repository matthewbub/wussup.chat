package api

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func ExampleAuthEndpoint(c *gin.Context) {
	log.Println("example auth endpoint hit")

	c.JSON(http.StatusOK, gin.H{
		"message": "JWT authenticated",
	})
}

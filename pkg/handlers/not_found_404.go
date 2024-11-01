package handlers

import (
	"log"

	"github.com/gin-gonic/gin"
)

func NotFound404(c *gin.Context) {
	log.Printf("404 Not Found: %s %s", c.Request.Method, c.Request.URL.Path)
	c.JSON(404, gin.H{"message": "Not Found"})
}

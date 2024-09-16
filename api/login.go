package api

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func LoginHandler(c *gin.Context) {
	username := c.PostForm("username")
	password := c.PostForm("password")
	email := c.PostForm("email")

	fmt.Printf("Username: %s\nPassword: %s\nEmail: %s\n", username, password, email)

	c.HTML(http.StatusOK, "landing.tmpl", gin.H{
		"title":   "Landing",
		"message": "Credentials received",
	})
}

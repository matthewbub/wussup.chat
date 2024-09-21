package main

import (
	"fmt"
	"net/http"

	"bus.zcauldron.com/api"
	"github.com/gin-gonic/gin"
)

func registerAuthRoutes(r *gin.Engine) {
	r.POST("/login", api.LoginHandler)
	r.POST("/sign-up", api.SignUpHandler)
	r.POST("/forgot-password", forgotPasswordHandler)
	r.POST("/upload", api.UploadHandler)
}

func forgotPasswordHandler(c *gin.Context) {
	email := c.PostForm("email")

	fmt.Printf("Email: %s\n", email)

	c.HTML(http.StatusOK, "landing.tmpl", gin.H{
		"title":   "Landing",
		"message": "Reset link sent to " + email,
	})
}

package main

import (
	"fmt"
	"net/http"

	"bus.zcauldron.com/api"
	"github.com/gin-gonic/gin"
)

func registerPublicApiRoutes(r *gin.Engine) {
	r.POST("/login", api.LoginHandler)
	r.POST("/sign-up", api.SignUpHandler)
	r.POST("/api/sign-up/security-questions", api.SecurityQuestionsHandler)
	r.POST("/forgot-password", forgotPasswordHandler)
}

func registerPrivateApiRoutes(auth *gin.RouterGroup) {
	auth.POST("/upload", api.UploadHandler)
	auth.POST("/upload/confirm", api.UploadConfirmHandler)
	auth.POST("/upload/confirm/save", api.SaveReceiptHandler)
	auth.GET("/logout", api.LogoutHandler)
}

func forgotPasswordHandler(c *gin.Context) {
	email := c.PostForm("email")

	fmt.Printf("Email: %s\n", email)

	c.HTML(http.StatusOK, "landing.go.tmpl", gin.H{
		"title":   "Landing",
		"message": "Reset link sent to " + email,
	})
}

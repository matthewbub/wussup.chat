package main

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func registerAuthRoutes(r *gin.Engine) {
	r.POST("/login", loginHandler)
	r.POST("/sign-up", signUpHandler)
	r.POST("/forgot-password", forgotPasswordHandler)
}

func loginHandler(c *gin.Context) {
	username := c.PostForm("username")
	password := c.PostForm("password")
	email := c.PostForm("email")

	fmt.Printf("Username: %s\nPassword: %s\nEmail: %s\n", username, password, email)

	c.HTML(http.StatusOK, "landing.html", gin.H{
		"title":   "Landing",
		"message": "Credentials received",
	})
}

func signUpHandler(c *gin.Context) {
	username := c.PostForm("username")
	password := c.PostForm("password")
	confirmPassword := c.PostForm("confirmPassword")
	email := c.PostForm("email")

	fmt.Printf("Username: %s\nPassword: %s\nConfirm Password: %s\nEmail: %s\n", username, password, confirmPassword, email)

	if password != confirmPassword {
		c.HTML(http.StatusOK, "sign-up.html", gin.H{
			"title":   "Sign Up",
			"message": "Passwords do not match",
		})
		return
	}

	c.HTML(http.StatusOK, "landing.html", gin.H{
		"title":   "Landing",
		"message": "Credentials received, please login",
	})
}

func forgotPasswordHandler(c *gin.Context) {
	email := c.PostForm("email")

	fmt.Printf("Email: %s\n", email)

	c.HTML(http.StatusOK, "landing.html", gin.H{
		"title":   "Landing",
		"message": "Reset link sent to " + email,
	})
}

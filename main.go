package main

import (
	"fmt"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	r.Static("/styles", "./styles")
	r.LoadHTMLGlob("templates/*")

	// STATIC PAGES

	r.GET("/", func(c *gin.Context) {
		c.HTML(200, "landing.html", gin.H{
			"title": "Landing Page",
		})
	})

	r.GET("/login", func(c *gin.Context) {
		c.HTML(200, "login.html", gin.H{
			"title": "Login Page",
		})
	})

	r.GET("/sign-up", func(c *gin.Context) {
		c.HTML(200, "sign-up.html", gin.H{
			"title": "Sign up Page",
		})
	})

	r.GET("/forgot-password", func(c *gin.Context) {
		c.HTML(200, "forgot-password.html", gin.H{
			"title": "Forgot Password Page",
		})
	})

	// API ROUTES FOR STATIC PAGES

	r.POST("/login", func(c *gin.Context) {
		username := c.PostForm("username")
		password := c.PostForm("password")
		email := c.PostForm("email")

		fmt.Printf("Username: %s\nPassword: %s\nEmail: %s\n", username, password, email)

		c.HTML(200, "landing.html", gin.H{
			"title":   "Landing Page",
			"message": "Credentials received",
		})
	})

	r.POST("/sign-up", func(c *gin.Context) {
		username := c.PostForm("username")
		password := c.PostForm("password")
		confirmPassword := c.PostForm("confirmPassword")
		email := c.PostForm("email")

		fmt.Printf("Username: %s\nPassword: %s\nConfirm Password: %s\nEmail: %s\n", username, password, confirmPassword, email)

		if password != confirmPassword {
			c.HTML(200, "sign-up.html", gin.H{
				"title":   "Sign Up Page",
				"message": "Passwords do not match",
			})
			return
		}

		c.HTML(200, "landing.html", gin.H{
			"title":   "Landing Page",
			"message": "Credentials received, please login",
		})
	})

	r.POST("/forgot-password", func(c *gin.Context) {
		email := c.PostForm("email")

		fmt.Printf("Email: %s\n", email)

		c.HTML(200, "landing.html", gin.H{
			"title":   "Landing Page",
			"message": "Reset link sent to " + email,
		})
	})

	r.Run(":8080")
}

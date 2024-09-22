package main

import (
	"html/template"
	"log"

	"bus.zcauldron.com/middleware"
	"bus.zcauldron.com/utils"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// Set trusted proxies
	r.SetTrustedProxies(nil)

	// Get secret key from environment variable
	secretKey := utils.GetSecretKeyFromEnv()
	// Create a new cookie store with the secret key
	store := cookie.NewStore([]byte(secretKey))
	// Use the cookie store for session management
	r.Use(sessions.Sessions("session", store))

	// Load styles as static files
	r.Static("/styles", "./styles")
	// Load all templates
	r.SetHTMLTemplate(template.Must(template.ParseGlob("templates/**/*.tmpl")))

	// Register all views
	registerPublicViews(r)

	auth := r.Group("/")
	auth.Use(middleware.AuthRequired())
	{
		registerPrivateViews(auth)
	}

	// Register all auth API routes
	registerAuthRoutes(r)

	log.Println("Server is running on port 8080")
	r.Run(":8080")
}

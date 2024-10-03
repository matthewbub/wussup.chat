package main

import (
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

	// session management
	secretKey := utils.GetSecretKeyFromEnv()
	store := cookie.NewStore([]byte(secretKey))
	r.Use(sessions.Sessions("session", store))

	// static files
	r.Static("/styles", "./public/styles")
	r.Static("/js", "./public/js")

	// alllll routes
	registerPublicViews(r)
	registerPublicApiRoutes(r)

	auth := r.Group("/")
	auth.Use(middleware.AuthRequired())
	{
		registerPrivateViews(auth)
		registerPrivateApiRoutes(auth)
	}

	log.Println("Server is running on port http://localhost:8080")
	r.Run(":8080")
}

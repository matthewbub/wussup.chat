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

	// session management
	secretKey := utils.GetSecretKeyFromEnv()
	store := cookie.NewStore([]byte(secretKey))
	r.Use(sessions.Sessions("session", store))

	// static files
	r.Static("/styles", "./styles")
	// r.Static("/scripts", "./public/scripts")
	r.Static("/js", "./public/js")
	r.SetHTMLTemplate(template.Must(template.ParseGlob("templates/**/*.tmpl")))

	// alllll groutes
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

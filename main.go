package main

import (
	"html/template"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// Set trusted proxies
	r.SetTrustedProxies(nil)

	r.Static("/styles", "./styles")

	// Load all templates
	r.SetHTMLTemplate(template.Must(template.ParseGlob("templates/*.tmpl")))

	// Register all views
	registerViews(r)

	// Register all auth API routes
	registerAuthRoutes(r)

	r.POST("/vulnerability-scanner", func(c *gin.Context) {
		c.HTML(200, "landing.html", gin.H{
			"title":   "Landing",
			"message": "Scan started",
		})
	})

	log.Println("Server is running on port 8080")
	r.Run(":8080")
}

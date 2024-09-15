package main

import (
	"html/template"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	r.Static("/styles", "./styles")

	// Load all templates
	r.SetHTMLTemplate(template.Must(template.ParseGlob("templates/*.tmpl")))

	// Register all views
	registerViews(r)

	// Register all auth API routes
	registerAuthRoutes(r)

	r.POST("/vulnerability-scanner", func(c *gin.Context) {
		// url := c.PostForm("name")

		c.HTML(200, "landing.html", gin.H{
			"title":   "Landing",
			"message": "Scan started",
		})
	})

	r.Run(":8080")
}

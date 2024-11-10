package api

import (
	"github.com/gin-gonic/gin"
	"github.com/invopop/jsonschema"
)

func SchemaHandler(c *gin.Context) {
	schemaType := c.Param("type")

	var schema *jsonschema.Schema

	switch schemaType {
	case "auth_check":
		schema = jsonschema.Reflect(&AuthCheckResponse{})
	default:
		c.JSON(404, gin.H{"error": "Schema not found"})
		return
	}

	c.Header("Content-Type", "application/schema+json")
	c.JSON(200, schema)
}

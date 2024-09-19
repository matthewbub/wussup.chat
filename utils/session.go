package utils

import (
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

// GetSession retrieves the session from the Gin context
func GetSession(c *gin.Context) sessions.Session {
	session := sessions.Default(c)
	return session
}

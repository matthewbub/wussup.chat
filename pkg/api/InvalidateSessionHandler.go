package api

import (
	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
)

// Pretty much the json version of logout.go

func InvalidateSessionHandler(c *gin.Context) {
	// Clear session
	session := utils.GetSession(c)
	session.Delete("user_id")
	session.Delete("username")
	session.Delete("email")
	err := session.Save()
	if err != nil {
		log.Println("Trouble invalidating session")
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
}

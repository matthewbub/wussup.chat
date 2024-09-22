package api

import (
	"net/http"

	"bus.zcauldron.com/utils"
	"github.com/gin-gonic/gin"
)

func LogoutHandler(c *gin.Context) {
	session := utils.GetSession(c)
	session.Delete("user_id")
	session.Delete("username")
	session.Delete("email")
	session.Save()
	c.Redirect(http.StatusSeeOther, "/login")
}

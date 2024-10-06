package middleware

import (
	"log"
	"net/http"

	"bus.zcauldron.com/utils"
	"github.com/gin-gonic/gin"
)

func SecurityQuestionsRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		session := utils.GetSession(c)
		userID := session.Get("user_id")
		if userID == nil {
			log.Println("[SecurityQuestionsRequired] User ID not found in session, redirecting to login")
			c.Redirect(http.StatusSeeOther, "/login")
			c.Abort()
			return
		}

		db := utils.Db()
		defer db.Close()

		var answered bool
		err := db.QueryRow("SELECT security_questions_answered FROM users WHERE id = ?", userID).Scan(&answered)
		if err != nil || !answered {
			log.Println("[SecurityQuestionsRequired] User not found in database, redirecting to sign-up")
			c.Redirect(http.StatusSeeOther, "/sign-up/security-questions")
			c.Abort()
			return
		}

		c.Next()
	}
}

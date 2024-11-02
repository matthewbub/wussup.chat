package middleware

import (
	"log"
	"net/http"

	"bus.zcauldron.com/pkg/operations"
	"bus.zcauldron.com/pkg/utils"
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

		log.Printf("[SecurityQuestionsRequired] User ID found in session: %v", userID)
		db := utils.Db()
		defer db.Close()

		answered, err := operations.CheckSecurityQuestionsAnswered(userID)
		log.Printf("[SecurityQuestionsRequired] Security questions answered: %v", answered)
		if err != nil {
			log.Printf("[SecurityQuestionsRequired] Error checking if security questions are answered: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
			c.Abort()
			return
		}

		if !answered {
			log.Printf("[SecurityQuestionsRequired] Security questions not answered for user %v, redirecting to security questions", userID)
			// c.Redirect(http.StatusSeeOther, "/sign-up/security-questions")
			// c.Abort()
			// return
		}

		c.Next()
	}
}

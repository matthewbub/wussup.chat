package jwt

import (
	"log"
	"net/http"

	"bus.zcauldron.com/pkg/operations"
	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-gonic/gin"
)

type SecurityQuestion struct {
	Question string `json:"question"`
	Answer   string `json:"answer"`
}

type SecurityQuestionsPayload struct {
	Questions []SecurityQuestion `json:"questions"`
}

func SecurityQuestionsHandler(c *gin.Context) {
	log.Println("[SecurityQuestionsHandler] Received request")
	// Get JWT from the request
	token, err := c.Cookie("jwt")
	if err != nil {
		log.Printf("[SecurityQuestionsHandler] Error getting JWT: %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{"ok": false, "message": "Unauthorized"})
		return
	}

	// Verify and extract user ID from JWT
	userID, _, err := utils.VerifyJWT(token)
	if err != nil {
		log.Printf("[SecurityQuestionsHandler] JWT verification failed: %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{"ok": false, "message": "Invalid or expired token"})
		return
	}

	// Check if security questions have already been answered
	answered, err := operations.CheckSecurityQuestionsAnswered(userID)
	if err != nil {
		log.Printf("[SecurityQuestionsHandler] Error checking answered status: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "message": "Error checking security questions status"})
		return
	}
	if answered {
		c.JSON(http.StatusConflict, gin.H{"ok": false, "message": "Security questions already answered"})
		return
	}

	var payload SecurityQuestionsPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		log.Printf("[SecurityQuestionsHandler] Error parsing JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"ok": false, "message": "Invalid data"})
		return
	}
	questions := payload.Questions
	if len(questions) != 3 {
		c.JSON(http.StatusBadRequest, gin.H{"ok": false, "message": "Please provide exactly three questions and answers"})
		return
	}
	for _, q := range questions {
		if q.Question == "" || q.Answer == "" {
			c.JSON(http.StatusBadRequest, gin.H{"ok": false, "message": "All questions and answers are required"})
			return
		}
	}

	// Insert security questions into the database
	err = operations.InsertSecurityQuestionsIntoDatabase(userID, questions[0].Question, questions[0].Answer, questions[1].Question, questions[1].Answer, questions[2].Question, questions[2].Answer)
	if err != nil {
		log.Printf("[SecurityQuestionsHandler] Error inserting security questions: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "message": "Error saving security questions"})
		return
	}

	// Mark security questions as answered
	err = operations.UpdateUserSecurityQuestionsAnswered(userID)
	if err != nil {
		log.Printf("[SecurityQuestionsHandler] Error updating answered status: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "message": "Error updating security questions status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"ok": true, "message": "Security questions saved successfully"})
}

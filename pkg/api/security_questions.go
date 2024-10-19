package api

import (
	"log"
	"net/http"

	"bus.zcauldron.com/pkg/models"
	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-gonic/gin"
)

func SecurityQuestionsHandler(c *gin.Context) {
	session := utils.GetSession(c)
	userIDInterface := session.Get("user_id")

	userID, ok := userIDInterface.(string)
	if !ok || userID == "" {
		log.Println("[SecurityQuestionsHandler] Invalid or missing user ID in session")
		renderErrorPage(c, http.StatusBadRequest, "Invalid session. Please try logging in again.")
		return
	}

	// Check if security questions have already been answered
	answered, err := models.CheckSecurityQuestionsAnswered(userID)
	if err != nil {
		log.Printf("[SecurityQuestionsHandler] Error checking if security questions are answered: %v", err)
		handleDatabaseError(c, err)
		return
	}

	if answered {
		log.Println("[SecurityQuestionsHandler] Security questions already answered")
		c.Redirect(http.StatusSeeOther, "/dashboard")
		return
	}

	question1 := utils.SanitizeInput(c.PostForm("question1"))
	answer1 := utils.SanitizeInput(c.PostForm("answer1"))
	question2 := utils.SanitizeInput(c.PostForm("question2"))
	answer2 := utils.SanitizeInput(c.PostForm("answer2"))
	question3 := utils.SanitizeInput(c.PostForm("question3"))
	answer3 := utils.SanitizeInput(c.PostForm("answer3"))

	// Validate form data
	if question1 == "" || answer1 == "" || question2 == "" || answer2 == "" || question3 == "" || answer3 == "" {
		log.Println("[SecurityQuestionsHandler] One or more question/answer fields are empty")
		renderErrorPage(c, http.StatusBadRequest, "All fields are required")
		return
	}

	// Insert security questions into database
	err = models.InsertSecurityQuestionsIntoDatabase(userID, question1, answer1, question2, answer2, question3, answer3)
	if err != nil {
		log.Printf("[SecurityQuestionsHandler] Error inserting security questions into database: %v", err)
		handleDatabaseError(c, err)
		return
	}

	// Update user to indicate security questions have been answered
	err = models.UpdateUserSecurityQuestionsAnswered(userID)
	if err != nil {
		log.Printf("[SecurityQuestionsHandler] Error updating user security questions answered: %v", err)
		handleDatabaseError(c, err)
		return
	}

	// Render success page or redirect to another page
	c.Redirect(http.StatusSeeOther, "/sign-up/success")
}

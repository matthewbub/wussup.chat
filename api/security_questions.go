package api

import (
	"log"
	"net/http"

	"bus.zcauldron.com/pkg/models"
	"bus.zcauldron.com/pkg/views"
	"bus.zcauldron.com/utils"
	"github.com/gin-gonic/gin"
)

func SecurityQuestionsHandler(c *gin.Context) {
	session := utils.GetSession(c)
	userID := session.Get("user_id")

	// Check if security questions have already been answered
	answered, err := models.CheckSecurityQuestionsAnswered(userID)
	if err != nil {
		log.Printf("[SecurityQuestionsHandler] Error checking if security questions are answered: %v", err)
		handleDatabaseError(c, err)
		return
	}

	if answered {
		log.Println("[SecurityQuestionsHandler] Security questions already answered, rendering 404 page")
		render404Page(c)
		return
	}

	question1 := utils.SanitizeInput(c.PostForm("question1"))
	answer1 := utils.SanitizeInput(c.PostForm("answer1"))
	question2 := utils.SanitizeInput(c.PostForm("question2"))
	answer2 := utils.SanitizeInput(c.PostForm("answer2"))
	question3 := utils.SanitizeInput(c.PostForm("question3"))
	answer3 := utils.SanitizeInput(c.PostForm("answer3"))

	// Validate form data
	if userID == "" || question1 == "" || answer1 == "" || question2 == "" || answer2 == "" || question3 == "" || answer3 == "" {
		log.Println("[SecurityQuestionsHandler] User ID or question/answer fields are empty")
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

func render404Page(c *gin.Context) {
	data := views.ErrorPageData{
		Title:      "404",
		IsLoggedIn: false,
	}
	views.ErrorPage(data).Render(c.Request.Context(), c.Writer)
}

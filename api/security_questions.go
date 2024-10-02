package api

import (
	"net/http"

	"bus.zcauldron.com/models"
	"bus.zcauldron.com/utils"
	"github.com/gin-gonic/gin"
)

func SecurityQuestionsHandler(c *gin.Context) {
	userID := utils.SanitizeInput(c.GetString("user_id"))
	question1 := utils.SanitizeInput(c.PostForm("question1"))
	answer1 := utils.SanitizeInput(c.PostForm("answer1"))
	question2 := utils.SanitizeInput(c.PostForm("question2"))
	answer2 := utils.SanitizeInput(c.PostForm("answer2"))
	question3 := utils.SanitizeInput(c.PostForm("question3"))
	answer3 := utils.SanitizeInput(c.PostForm("answer3"))

	// Validate form data
	if userID == "" || question1 == "" || answer1 == "" || question2 == "" || answer2 == "" || question3 == "" || answer3 == "" {
		renderErrorPage(c, http.StatusBadRequest, "All fields are required")
		return
	}

	// Insert security questions into database
	err := models.InsertSecurityQuestionsIntoDatabase(userID, question1, answer1, question2, answer2, question3, answer3)
	if err != nil {
		handleDatabaseError(c, err)
		return
	}

	// Render success page or redirect to another page
	c.Redirect(http.StatusSeeOther, "/sign-up/success")
}

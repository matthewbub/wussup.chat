package api

import (
	"fmt"
	"net/http"
	"time"

	"github.com/google/uuid"

	"bus.zcauldron.com/pkg/api/response"
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
	// Get JWT from the request
	token, err := c.Cookie("jwt")
	if err != nil {
		c.JSON(http.StatusUnauthorized, response.Error(
			"Unauthorized",
			response.AUTHENTICATION_FAILED,
		))
		return
	}

	// Verify and extract user ID from JWT
	userID, _, err := utils.VerifyJWT(token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, response.Error(
			"Invalid or expired token",
			response.AUTHENTICATION_FAILED,
		))
		return
	}

	var payload SecurityQuestionsPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, response.Error(
			"Invalid request data",
			response.INVALID_REQUEST_DATA,
		))
		return
	}

	// Validate questions
	if err := validateSecurityQuestions(payload.Questions); err != nil {
		c.JSON(http.StatusBadRequest, response.Error(
			err.Error(),
			response.INVALID_REQUEST_DATA,
		))
		return
	}

	// Insert security questions into the database
	if err := insertSecurityQuestionsIntoDatabase(userID, payload.Questions[0].Question, payload.Questions[0].Answer,
		payload.Questions[1].Question, payload.Questions[1].Answer, payload.Questions[2].Question, payload.Questions[2].Answer); err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(
			"Failed to save security questions",
			response.OPERATION_FAILED,
		))
		return
	}

	c.JSON(http.StatusOK, response.SuccessMessage(
		"Security questions saved successfully",
	))
}

// New validation helper function
func validateSecurityQuestions(questions []SecurityQuestion) error {
	if len(questions) != 3 {
		return fmt.Errorf("please provide exactly three questions and answers")
	}

	for _, q := range questions {
		if q.Question == "" || q.Answer == "" {
			return fmt.Errorf("all questions and answers are required")
		}
	}
	return nil
}

func insertSecurityQuestionsIntoDatabase(userID string, question1, answer1, question2, answer2, question3, answer3 string) error {
	db := utils.GetDB()

	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Insert security questions
	stmt, err := tx.Prepare("INSERT INTO security_questions (id, user_id, question_1, answer_1, question_2, answer_2, question_3, answer_3, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
	if err != nil {
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	_, err = stmt.Exec(uuid.New().String(), userID, question1, answer1, question2, answer2, question3, answer3, time.Now())
	if err != nil {
		return fmt.Errorf("failed to insert security questions: %w", err)
	}

	stmt.Close()

	// Update user status within the same transaction
	stmt, err = tx.Prepare("UPDATE users SET security_questions_answered = ? WHERE id = ?")
	if err != nil {
		return fmt.Errorf("failed to prepare update statement: %w", err)
	}

	_, err = stmt.Exec(true, userID)
	if err != nil {
		return fmt.Errorf("failed to update user security questions status: %w", err)
	}

	// Commit transaction
	if err = tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

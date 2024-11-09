package api

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/google/uuid"

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
		c.JSON(http.StatusUnauthorized, utils.JR(utils.JsonResponse{
			Ok:      false,
			Message: "Unauthorized",
			Code:    "UNAUTHORIZED",
		}))
		return
	}

	// Verify and extract user ID from JWT
	userID, _, err := utils.VerifyJWT(token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, utils.JR(utils.JsonResponse{
			Ok:      false,
			Message: "Invalid or expired token",
			Code:    "INVALID_TOKEN",
		}))
		return
	}

	//// Check if security questions have already been answered
	//answered, err := checkSecurityQuestionsAnswered(userID)
	//if err != nil {
	//	c.JSON(http.StatusInternalServerError, utils.JR(utils.JsonResponse{
	//		Ok:      false,
	//		Message: "Server error",
	//		Code:    "SERVER_ERROR",
	//		Error:   err.Error(),
	//	}))
	//	return
	//}
	//if answered {
	//	c.JSON(http.StatusConflict, utils.JR(utils.JsonResponse{
	//		Ok:      false,
	//		Message: "Security questions already answered",
	//		Code:    "QUESTIONS_ALREADY_ANSWERED",
	//	}))
	//	return
	//}

	var payload SecurityQuestionsPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, utils.JR(utils.JsonResponse{
			Ok:      false,
			Message: "Invalid request data",
			Code:    "INVALID_REQUEST_DATA",
		}))
		return
	}

	questions := payload.Questions
	if len(questions) != 3 {
		c.JSON(http.StatusBadRequest, utils.JR(utils.JsonResponse{
			Ok:      false,
			Message: "Please provide exactly three questions and answers",
			Code:    "INVALID_QUESTIONS_COUNT",
		}))
		return
	}

	for _, q := range questions {
		if q.Question == "" || q.Answer == "" {
			c.JSON(http.StatusBadRequest, utils.JR(utils.JsonResponse{
				Ok:      false,
				Message: "All questions and answers are required",
				Code:    "MISSING_REQUIRED_FIELDS",
			}))
			return
		}
	}

	// Insert security questions into the database
	err = insertSecurityQuestionsIntoDatabase(userID, questions[0].Question, questions[0].Answer,
		questions[1].Question, questions[1].Answer, questions[2].Question, questions[2].Answer)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.JR(utils.JsonResponse{
			Ok:      false,
			Message: "Failed to save security questions",
			Code:    "FAILED_TO_SAVE_QUESTIONS",
			Error:   err.Error(),
		}))
		return
	}

	// Mark security questions as answered
	err = updateUserSecurityQuestionsAnswered(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.JR(utils.JsonResponse{
			Ok:      false,
			Message: "Failed to update security questions status",
			Code:    "FAILED_TO_UPDATE_STATUS",
			Error:   err.Error(),
		}))
		return
	}

	c.JSON(http.StatusOK, utils.JR(utils.JsonResponse{
		Ok:      true,
		Message: "Security questions saved successfully",
	}))
}

func checkSecurityQuestionsAnswered(userID string) (bool, error) {
	db := utils.Db()
	defer db.Close()

	var answered bool
	err := db.QueryRow("SELECT security_questions_answered FROM users WHERE id = ?", userID).Scan(&answered)
	if errors.Is(err, sql.ErrNoRows) {
		return false, nil // User not found, treat as not answered
	}
	if err != nil {
		return false, fmt.Errorf("failed to check security questions status: %w", err)
	}

	return answered, nil
}

func insertSecurityQuestionsIntoDatabase(userID string, question1, answer1, question2, answer2, question3, answer3 string) error {
	db := utils.Db()
	defer db.Close()

	// Start transaction
	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback() // Rollback if not committed

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

func updateUserSecurityQuestionsAnswered(userID string) error {
	db := utils.Db()
	defer db.Close()

	stmt, err := db.Prepare("UPDATE users SET security_questions_answered = ? WHERE id = ?")
	if err != nil {
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	_, err = stmt.Exec(true, userID)
	if err != nil {
		return fmt.Errorf("failed to update security questions status: %w", err)
	}

	return nil
}

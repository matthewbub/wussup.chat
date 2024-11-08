package operations

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"bus.zcauldron.com/pkg/utils"
	"github.com/google/uuid"
)

func InsertSecurityQuestionsIntoDatabase(userID interface{}, question1, answer1, question2, answer2, question3, answer3 string) error {
	db := utils.Db()
	defer db.Close()

	// Use a prepared statement to prevent SQL injection
	stmt, err := db.Prepare("INSERT INTO security_questions (id, user_id, question_1, answer_1, question_2, answer_2, question_3, answer_3, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
	if err != nil {
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	var uuid string = uuid.New().String()
	_, err = stmt.Exec(uuid, userID, question1, answer1, question2, answer2, question3, answer3, time.Now())
	if err != nil {
		return fmt.Errorf("failed to execute statement: %w", err)
	}

	// Update user to indicate security questions have been answered
	err = UpdateUserSecurityQuestionsAnswered(userID)
	if err != nil {
		return fmt.Errorf("failed to update user security questions answered: %w", err)
	}

	log.Printf("[InsertSecurityQuestionsIntoDatabase] Security questions inserted for user %v", userID)

	return nil
}

func CheckSecurityQuestionsAnswered(userID interface{}) (bool, error) {
	db := utils.Db()
	defer db.Close()

	var answered bool
	err := db.QueryRow("SELECT security_questions_answered FROM active_users WHERE id = ?", userID).Scan(&answered)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil // User not found, treat as not answered
		}
		return false, err
	}

	return answered, nil
}

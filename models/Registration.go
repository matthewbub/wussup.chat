package models

import (
	"fmt"
	"time"

	"bus.zcauldron.com/utils"
	"github.com/google/uuid"
)

func InsertSecurityQuestionsIntoDatabase(userID, question1, answer1, question2, answer2, question3, answer3 string) error {
	db := utils.Db()
	defer db.Close()

	// Use a prepared statement to prevent SQL injection
	stmt, err := db.Prepare("INSERT INTO security_questions (id, user_id, question_1, answer_1, question_2, answer_2, question_3, answer_3, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
	if err != nil {
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	var uuid string = uuid.New().String()
	_, err = stmt.Exec(uuid, userID, question1, answer1, question2, answer2, question3, answer3, time.Now())
	if err != nil {
		return fmt.Errorf("failed to execute statement: %w", err)
	}

	return nil
}

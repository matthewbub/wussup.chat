package models

import (
	"fmt"
	"log"
	"time"

	"bus.zcauldron.com/pkg/utils"
	"github.com/google/uuid"
)

func InsertUserIntoDatabase(username, hashedPassword, email string) error {
	db := utils.Db()
	defer db.Close()

	// Use a prepared statement to prevent SQL injection
	stmt, err := db.Prepare("INSERT INTO users (id, username, password, email, created_at, updated_at, security_questions_answered) VALUES (?, ?, ?, ?, ?, ?, ?)")
	if err != nil {
		log.Println(err)
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	var uuid string = uuid.New().String()
	_, err = stmt.Exec(uuid, username, hashedPassword, email, time.Now(), time.Now(), false)
	if err != nil {
		log.Println(err)
		return fmt.Errorf("failed to execute statement: %w", err)
	}

	return nil
}

func UpdateUserSecurityQuestionsAnswered(userID interface{}) error {
	db := utils.Db()
	defer db.Close()

	_, err := db.Exec("UPDATE users SET security_questions_answered = ? WHERE id = ?", true, userID)
	if err != nil {
		log.Println(err)
		return err
	}

	return nil
}

func GetUserFromDatabase(username string) (*utils.UserObject, error) {
	db := utils.Db()
	defer db.Close()

	user := utils.UserObject{}
	err := db.QueryRow("SELECT id, username, email, security_questions_answered FROM users WHERE username = ?", username).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.SecurityQuestionsAnswered,
	)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	return &user, nil
}

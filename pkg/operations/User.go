package operations

import (
	"database/sql"
	"fmt"
	"log"
	"strings"
	"time"

	"bus.zcauldron.com/pkg/utils"
	"github.com/google/uuid"
)

func InsertUserIntoDatabase(username, hashedPassword, email string) error {
	db := utils.Db()
	defer db.Close()

	// Use a prepared statement to prevent SQL injection
	stmt, err := db.Prepare("INSERT INTO users (id, username, password, email, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)")
	if err != nil {
		log.Println(err)
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	var uuid string = uuid.New().String()
	_, err = stmt.Exec(uuid, username, hashedPassword, email, time.Now(), time.Now())
	if err != nil {
		log.Println(err)
		return fmt.Errorf("failed to execute statement: %w", err)
	}

	// Insert the password into the password history
	stmt, err = db.Prepare("INSERT INTO password_history (user_id, password) VALUES (?, ?)")
	if err != nil {
		log.Println(err)
		return fmt.Errorf("failed to prepare password history statement: %w", err)
	}
	defer stmt.Close()

	_, err = stmt.Exec(uuid, hashedPassword)
	if err != nil {
		log.Println(err)
		return fmt.Errorf("failed to insert password into history: %w", err)
	}

	return nil
}

func UpdateUserSecurityQuestionsAnswered(userID interface{}) error {
	db := utils.Db()
	defer db.Close()

	stmt, err := db.Prepare("UPDATE users SET security_questions_answered = ? WHERE id = ?")
	if err != nil {
		log.Println(err)
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(true, userID)
	if err != nil {
		log.Println(err)
		return err
	}

	log.Printf("[UpdateUserSecurityQuestionsAnswered] Security questions answered updated for user %v", userID)

	return nil
}

func GetUserFromDatabase(username string) (*utils.UserWithRole, error) {
	db := utils.Db()
	defer db.Close()

	user := utils.UserWithRole{}
	stmt, err := db.Prepare("SELECT id, username, email, security_questions_answered, application_environment_role FROM active_users WHERE username = ?")
	if err != nil {
		log.Println(err)
		return nil, err
	}
	defer stmt.Close()

	err = stmt.QueryRow(username).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.SecurityQuestionsAnswered,
		&user.ApplicationEnvironmentRole,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		log.Println(err)
		return nil, err
	}

	return &user, nil
}

func GetUserByID(userID string) (*utils.UserWithRole, error) {
	db := utils.Db()
	defer db.Close()

	user := utils.UserWithRole{}
	stmt, err := db.Prepare("SELECT id, username, email, security_questions_answered, application_environment_role FROM active_users WHERE id = ?")
	if err != nil {
		log.Println(err)
		return nil, err
	}
	defer stmt.Close()

	err = stmt.QueryRow(userID).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.SecurityQuestionsAnswered,
		&user.ApplicationEnvironmentRole,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		log.Println(err)
		return nil, err
	}

	return &user, nil
}

func GetUserWithPasswordByID(userID string) (*utils.UserWithRole, error) {
	db := utils.Db()
	defer db.Close()

	user := utils.UserWithRole{}
	stmt, err := db.Prepare("SELECT id, username, email, security_questions_answered, password, application_environment_role FROM active_users WHERE id = ?")
	if err != nil {
		log.Println(err)
		return nil, err
	}
	defer stmt.Close()

	err = stmt.QueryRow(userID).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.SecurityQuestionsAnswered,
		&user.Password,
		&user.ApplicationEnvironmentRole,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		log.Println(err)
		return nil, err
	}

	return &user, nil
}

func GetUserWithRoleByID(userID string) (*utils.UserWithRole, error) {
	db := utils.Db()
	defer db.Close()

	user := utils.UserWithRole{}

	stmt, err := db.Prepare("SELECT id, username, email, security_questions_answered, application_environment_role, password, inactive_at FROM active_users WHERE id = ?")
	if err != nil {
		log.Println(err)
		return nil, err
	}

	err = stmt.QueryRow(userID).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.SecurityQuestionsAnswered,
		&user.ApplicationEnvironmentRole,
		&user.Password,
		&user.InactiveAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		log.Println(err)
		return nil, err
	}

	return &user, nil
}

func UpdateUserPassword(userID, hashedPassword string) error {
	db := utils.Db()
	defer db.Close()

	stmt, err := db.Prepare("UPDATE active_users SET password = ? WHERE id = ?")
	if err != nil {
		log.Println(err)
		return err
	}

	_, err = stmt.Exec(hashedPassword, userID)
	if err != nil {
		log.Println(err)
		return err
	}

	log.Printf("[UpdateUserPassword] Password updated for user %v", userID)

	// Insert the password into the password history
	stmt, err = db.Prepare("INSERT INTO password_history (user_id, password) VALUES (?, ?)")
	if err != nil {
		log.Println(err)
		return err
	}

	_, err = stmt.Exec(userID, hashedPassword)
	if err != nil {
		log.Println(err)
		return err
	}

	return nil
}

func GetUserWithPasswordByUserName(username string) (*utils.UserWithRole, error) {
	db := utils.Db()
	defer db.Close()

	user := utils.UserWithRole{}
	stmt, err := db.Prepare("SELECT id, username, email, security_questions_answered, password, inactive_at FROM active_users WHERE username = ?")
	if err != nil {
		log.Println(err)
		return nil, err
	}
	defer stmt.Close()

	err = stmt.QueryRow(username).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.SecurityQuestionsAnswered,
		&user.Password,
		&user.InactiveAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		log.Println(err)
		return nil, err
	}

	return &user, nil
}

func DeleteUser(userID string) error {
	db := utils.Db()
	defer db.Close()

	stmt, err := db.Prepare("UPDATE users SET inactive_at = ?, updated_at = ? WHERE id = ?")
	if err != nil {
		log.Println(err)
		return err
	}

	_, err = stmt.Exec(time.Now(), time.Now(), userID)
	if err != nil {
		log.Println(err)
		return err
	}

	return nil
}

func UpdateUserEmail(userID, email string) error {
	db := utils.Db()
	defer db.Close()

	if email == "" || !strings.Contains(email, "@") || len(email) > 255 {
		return fmt.Errorf("invalid email")
	}

	// Check if email is already in use by another user
	var existingUserID string
	stmt, err := db.Prepare("SELECT id FROM users WHERE email = ? AND id != ?")
	if err != nil {
		log.Println(err)
		return err
	}
	err = stmt.QueryRow(email, userID).Scan(&existingUserID)
	if err != nil && err != sql.ErrNoRows {
		log.Println(err)
		return err
	}
	if existingUserID != "" {
		return fmt.Errorf("email already in use")
	}

	stmt, err = db.Prepare("UPDATE users SET email = ? WHERE id = ?")
	if err != nil {
		log.Println(err)
		return err
	}

	_, err = stmt.Exec(email, userID)
	if err != nil {
		log.Println(err)
		return err
	}

	return nil
}

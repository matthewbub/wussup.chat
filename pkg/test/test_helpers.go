package test

import (
	"context"
	"database/sql"
	"fmt"
	"os"

	_ "github.com/mattn/go-sqlite3"
)

var TestConfig = struct {
	PrimaryUser    string
	PrimaryEmail   string
	SecondaryUser  string
	SecondaryEmail string
	Password       string
}{
	PrimaryUser:    "testuser1",
	PrimaryEmail:   "test1@example.com",
	SecondaryUser:  "testuser2",
	SecondaryEmail: "test2@example.com",
	Password:       "Password123!", // Nobody should use this password in production
}

func GetNextUser() (string, string, error) {
	ctx := context.Background()
	dbPath := os.Getenv("TEST_DB_PATH")
	if dbPath == "" {
		dbPath = "pkg/database/test.db"
	}

	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return "", "", fmt.Errorf("failed to open test database: %w", err)
	}
	defer db.Close()

	stmt, err := db.PrepareContext(ctx, "SELECT username, email, id FROM user_history ORDER BY id DESC LIMIT 1")
	if err != nil {
		return "", "", fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	row := stmt.QueryRowContext(ctx)
	var username string
	var email string
	var id int
	err = row.Scan(&username, &email, &id)
	if err != nil {
		return "", "", fmt.Errorf("failed to get next user: %w", err)
	}

	return fmt.Sprintf("testuser%d", id+1), fmt.Sprintf("testuser%d@example.com", id+1), nil
}

func GetPrimaryUser() (string, string) {
	return TestConfig.PrimaryUser, TestConfig.PrimaryEmail
}

func GetSecondaryUser() (string, string) {
	return TestConfig.SecondaryUser, TestConfig.SecondaryEmail
}

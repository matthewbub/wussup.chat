package test

import (
	"database/sql"
	"fmt"
	"log"
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

func GetNextUser() (string, string) {
	db, err := sql.Open("sqlite3", "pkg/database/test.db")
	if err != nil {
		log.Fatalf("Failed to open test database: %v", err)
	}
	defer db.Close()

	row := db.QueryRow("SELECT username, email, id FROM user_history ORDER BY id DESC LIMIT 1")
	var username string
	var email string
	var id int
	err = row.Scan(&username, &email, &id)
	if err != nil {
		log.Fatalf("Failed to get next user: %v", err)
	}

	return fmt.Sprintf("testuser%d", id+1), fmt.Sprintf("testuser%d@example.com", id+1)
}

func GetPrimaryUser() (string, string) {
	return TestConfig.PrimaryUser, TestConfig.PrimaryEmail
}

func GetSecondaryUser() (string, string) {
	return TestConfig.SecondaryUser, TestConfig.SecondaryEmail
}

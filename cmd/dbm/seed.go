package main

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"golang.org/x/crypto/bcrypt"
)

func db() *sql.DB {
	db, err := sql.Open("sqlite3", "./dev.db")
	if err != nil {
		fmt.Println("Error opening database. Are you sure it exists?")
		log.Fatal(err)
	}
	return db
}

func hashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedPassword), nil
}

func insertUserIntoDatabase(username, hashedPassword, email string) error {
	db := db()
	defer db.Close()

	_, err := db.Exec("INSERT INTO users (username, password, email, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
		username, hashedPassword, email, time.Now(), time.Now())
	return err
}

package utils

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
)

func Db() *sql.DB {
	// Get the current working directory
	cwd, err := os.Getwd()
	if err != nil {
		log.Fatal("Error getting current working directory:", err)
	}

	// Construct the database path
	dbPath := filepath.Join(cwd, "cmd", "dbm", "dev.db")

	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		fmt.Println("Error opening database. Are you sure it exists?")
		log.Fatal(err)
	}
	return db
}

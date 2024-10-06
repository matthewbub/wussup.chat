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
	fmt.Printf("cwd %s\n", cwd)

	// Construct the database path
	// TODO: Make this configurable
	dbPath := filepath.Join(cwd, "pkg", "database", "dev.db")
	fmt.Printf("line path %s\n", dbPath)
	db, err := sql.Open("sqlite3", dbPath)

	if err != nil {
		fmt.Println("Error opening database. Are you sure it exists?")
		log.Fatal(err)
	}
	return db
}

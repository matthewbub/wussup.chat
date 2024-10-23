package utils

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
	_ "github.com/mattn/go-sqlite3"
)

func init() {
	// Load .env file if it exists
	err := godotenv.Load()
	if err != nil {
		log.Printf("Failed to init the env")
		return
	}
}

func Db() *sql.DB {
	// Get the current working directory
	cwd, err := os.Getwd()
	if err != nil {
		log.Fatal("Error getting current working directory:", err)
	}

	var dbPath string
	if os.Getenv("ENV") == "development" {
		dbPath = filepath.Join(cwd, "pkg", "database", "dev.db")
		fmt.Println("Using development database:", dbPath)
	} else {
		dbPath = filepath.Join(cwd, "pkg", "database", "prod.db")
		fmt.Println("Using production database:", dbPath)
	}
	db, err := sql.Open("sqlite3", dbPath)

	if err != nil {
		fmt.Println("Error opening database. Are you sure it exists?")
		log.Fatal(err)
	}
	return db
}

package utils

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/joho/godotenv"
	_ "github.com/mattn/go-sqlite3"
)

var (
	db *sql.DB
	// once sync.Once
)

// GetDB returns a singleton database connection
func GetDB() *sql.DB {
	once.Do(func() {
		db = initDB()
	})
	return db
}

func initDB() *sql.DB {
	// Load .env file if it exists
	err := godotenv.Load()
	if err != nil {
		log.Printf("Failed to init the env")
		return nil
	}

	// Get the current working directory
	cwd, err := os.Getwd()
	if err != nil {
		log.Fatal("Error getting current working directory:", err)
	}

	var dbPath string
	env := GetEnv()
	if env == "development" {
		dbPath = filepath.Join(cwd, "pkg", "database", "dev.db")
		fmt.Println("Using development database:", dbPath)
	} else if env == "production" {
		dbPath = filepath.Join(cwd, "pkg", "database", "prod.db")
		fmt.Println("Using production database:", dbPath)
	} else {
		fmt.Println("Unknown environment. Using development database.")
		dbPath = filepath.Join(cwd, "pkg", "database", "dev.db")
	}
	db, err := sql.Open("sqlite3", dbPath)

	if err != nil {
		fmt.Println("Error opening database. Are you sure it exists?")
		log.Fatal(err)
	}

	// Configure the connection pool
	db.SetMaxOpenConns(25) // Adjust based on your needs
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	return db
}

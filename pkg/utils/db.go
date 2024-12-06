package utils

import (
	"database/sql"
	"log"
	"os"
	"path/filepath"
	"sync"
	"time"

	"bus.zcauldron.com/pkg/constants"
	_ "github.com/mattn/go-sqlite3"
)

var (
	db     *sql.DB
	doOnce sync.Once
)

// GetDB returns a singleton database connection
func GetDB() *sql.DB {
	doOnce.Do(func() {
		db = initDB()
		if db == nil {
			log.Fatal("Failed to initialize the database.")
		}
	})
	return db
}

func initDB() *sql.DB {
	// Get the current working directory
	cwd, err := os.Getwd()
	if err != nil {
		log.Fatal("Error getting current working directory:", err)
	}

	var dbPath string
	env := GetEnv()
	logger := GetLogger()

	switch env {
	case constants.ENV_PRODUCTION:
		dbPath = filepath.Join(cwd, "pkg", "database", "prod.db")
	case constants.ENV_STAGING:
		dbPath = filepath.Join(cwd, "pkg", "database", "staging.db")
	case constants.ENV_DEVELOPMENT:
		dbPath = filepath.Join(cwd, "pkg", "database", "dev.db")
	case constants.ENV_TEST:
		dbPath = filepath.Join(cwd, "pkg", "database", "test.db")
	default:
		logger.Fatalf("An unrecognized environment was detected. Aborting.")
		panic("An unrecognized environment was detected. Aborting.")
	}

	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		logger.Fatalf("Database file does not exist at path: %s", dbPath)
		return nil
	}

	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		logger.Fatalf("Error opening database. Are you sure it exists? %v", err)
		return nil
	}

	// Test the database connection
	if err := db.Ping(); err != nil {
		logger.Fatalf("Failed to ping database: %v", err)
		return nil
	}

	// Configure the connection pool
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	return db
}

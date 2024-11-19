package utils

import (
	"database/sql"
	"log"
	"os"

	"bus.zcauldron.com/pkg/test"
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/sqlite3"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/mattn/go-sqlite3"
)

func RunMigrations() {
	env := GetEnv()
	var dbPath string

	log.Println("Running migrations")

	if env == "production" {
		dbPath = "sqlite3://pkg/database/prod.db?cache=shared&mode=rwc"
	} else if env == "development" {
		dbPath = "sqlite3://pkg/database/dev.db?cache=shared&mode=rwc"
	} else if env == "test" {
		dbPath = "sqlite3://pkg/database/test.db?cache=shared&mode=rwc"
	}

	m, err := migrate.New(
		"file://pkg/database/migrations",
		dbPath)
	if err != nil {
		log.Fatalf("Failed to create migrate instance: %v", err)
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	log.Println("Migrations completed")
}

func RunMigrationsTest() {
	log.Println("Running migrations for test")

	// DropTestDatabase()

	db, err := sql.Open("sqlite3", "pkg/database/test.db")
	if err != nil {
		log.Fatalf("Failed to open test database: %v", err)
	}
	defer db.Close()

	// THis is a lame little table to track unique user names and emails
	// in the db becuase we enforce those restrictions at a db level
	// it's not in a migration file because its only used for testing
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS user_history (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT,
			email TEXT
		)
	`)
	if err != nil {
		log.Fatalf("Failed to create test history table: %v", err)
	}

	_, err = db.Exec(`
		INSERT INTO user_history (username, email) 
		VALUES (?, ?)
	`, test.TestConfig.PrimaryUser, test.TestConfig.PrimaryEmail)
	if err != nil {
		log.Fatalf("Failed to insert primary test user: %v", err)
	}

	_, err = db.Exec(`
		INSERT INTO user_history (username, email) 
		VALUES (?, ?)
	`, test.TestConfig.SecondaryUser, test.TestConfig.SecondaryEmail)
	if err != nil {
		log.Fatalf("Failed to insert secondary test user: %v", err)
	}

	log.Println("Test history table created")
}

// DropTestDatabase wipe clean for the next test
func DropTestDatabase() {
	log.Println("Dropping test database")
	os.Remove("pkg/database/test.db")
	log.Println("Test database dropped")
}

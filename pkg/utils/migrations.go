package utils

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"

	"bus.zcauldron.com/pkg/test"
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/sqlite3"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/mattn/go-sqlite3"
)

func RunMigrations() error {
	env := GetEnv()
	dbPath := os.Getenv("DATABASE_PATH")
	if dbPath == "" {
		switch env {
		case "production":
			dbPath = "sqlite3://pkg/database/prod.db?cache=shared&mode=rwc"
		case "development":
			dbPath = "sqlite3://pkg/database/dev.db?cache=shared&mode=rwc"
		case "test":
			dbPath = "sqlite3://pkg/database/test.db?cache=shared&mode=rwc"
		default:
			return fmt.Errorf("invalid environment: %s", env)
		}
	}

	m, err := migrate.New(
		"file://pkg/database/migrations",
		dbPath)
	if err != nil {
		return fmt.Errorf("failed to create migrate instance: %w", err)
	}

	defer func() {
		sourceErr, dbErr := m.Close()
		if sourceErr != nil {
			// We can't return these errors since we're in a defer,
			// but we should at least log them
			log.Printf("Error closing migration source: %v", sourceErr)
		}
		if dbErr != nil {
			log.Printf("Error closing migration database: %v", dbErr)
		}
	}()

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	return nil
}

func RunMigrationsTest() error {
	ctx := context.Background()
	dbPath := os.Getenv("TEST_DB_PATH")
	if dbPath == "" {
		dbPath = "pkg/database/test.db"
	}

	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return fmt.Errorf("failed to open test database: %w", err)
	}
	defer db.Close()

	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer func() {
		if err != nil {
			tx.Rollback()
			return
		}
		if err = tx.Commit(); err != nil {
			err = fmt.Errorf("failed to commit transaction: %w", err)
		}
	}()

	// THis is a lame little table to track unique user names and emails
	// in the db becuase we enforce those restrictions at a db level
	// it's not in a migration file because its only used for testing
	_, err = tx.ExecContext(ctx, `
		CREATE TABLE IF NOT EXISTS user_history (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT,
			email TEXT
		)
	`)
	if err != nil {
		return fmt.Errorf("failed to create test history table: %w", err)
	}

	stmt, err := tx.PrepareContext(ctx, `
		INSERT INTO user_history (username, email) 
		VALUES (?, ?)
	`)
	if err != nil {
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	_, err = stmt.ExecContext(ctx, test.TestConfig.PrimaryUser, test.TestConfig.PrimaryEmail)
	if err != nil {
		return fmt.Errorf("failed to insert primary test user: %w", err)
	}

	_, err = stmt.ExecContext(ctx, test.TestConfig.SecondaryUser, test.TestConfig.SecondaryEmail)
	if err != nil {
		return fmt.Errorf("failed to insert secondary test user: %w", err)
	}

	return nil
}

// DropTestDatabase removes the test database file if it exists
func DropTestDatabase() error {
	dbPath := os.Getenv("TEST_DB_PATH")
	if dbPath == "" {
		dbPath = "pkg/database/test.db"
	}

	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		return nil
	}

	if err := os.Remove(dbPath); err != nil {
		return fmt.Errorf("failed to drop test database: %w", err)
	}

	// Verify removal
	if _, err := os.Stat(dbPath); !os.IsNotExist(err) {
		return fmt.Errorf("test database file still exists after drop attempt")
	}

	return nil
}

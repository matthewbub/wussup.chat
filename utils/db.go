package utils

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

func Db() *sql.DB {
	db, err := sql.Open("sqlite3", "../cmd/dbm/dev.db")
	if err != nil {
		fmt.Println("Error opening database. Are you sure it exists?")
		log.Fatal(err)
	}
	return db
}

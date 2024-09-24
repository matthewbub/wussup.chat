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

func insertMerchantIntoDatabase(userId int, name string) error {
	db := db()
	defer db.Close()

	_, err := db.Exec("INSERT INTO merchants (user_id, name, created_at, updated_at) VALUES (?, ?, ?, ?)",
		userId, name, time.Now(), time.Now())
	return err
}

func insertReceiptIntoDatabase(userId int, merchantId int, total float64, date string) error {
	db := db()
	defer db.Close()

	_, err := db.Exec("INSERT INTO receipts (user_id, merchant_id, total, date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
		userId, merchantId, total, date, time.Now(), time.Now())
	return err
}

func insertPurchasedItemIntoDatabase(userId int, merchantId int, receiptId int, name string, price float64) error {
	db := db()
	defer db.Close()

	_, err := db.Exec("INSERT INTO purchased_items (user_id, merchant_id, receipt_id, name, price, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
		userId, merchantId, receiptId, name, price, time.Now(), time.Now())
	return err
}

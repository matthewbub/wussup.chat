package utils

import (
	"time"
)

// TODO sanitize inputs
func InsertMerchantIntoDatabase(userId int, name string) error {
	db := Db()
	defer db.Close()

	_, err := db.Exec("INSERT INTO merchants (user_id, name, created_at, updated_at) VALUES (?, ?, ?, ?)",
		userId, name, time.Now(), time.Now())
	return err
}

// TODO sanitize inputs
func InsertReceiptIntoDatabase(userId int, merchantId int, total float64, date string) error {
	db := Db()
	defer db.Close()

	_, err := db.Exec("INSERT INTO receipts (user_id, merchant_id, total, date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
		userId, merchantId, total, date, time.Now(), time.Now())
	return err
}

// TODO sanitize inputs
func InsertPurchasedItemIntoDatabase(userId int, merchantId int, receiptId int, name string, price float64, confidence float64) error {
	db := Db()
	defer db.Close()

	_, err := db.Exec("INSERT INTO purchased_items (user_id, merchant_id, receipt_id, name, price, confidence, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
		userId, merchantId, receiptId, name, price, confidence, time.Now(), time.Now())
	return err
}

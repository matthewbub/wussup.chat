package models

import (
	"database/sql"
	"fmt"
	"strconv"
	"time"

	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-gonic/gin"
)

type Receipt struct {
	ID        string         `db:"id"`
	Merchant  string         `db:"merchant"`
	Date      string         `db:"date"`
	Total     string         `db:"total"`
	CreatedAt string         `db:"created_at"`
	UpdatedAt string         `db:"updated_at"`
	Notes     sql.NullString `db:"notes"`
	Items     []Item         `db:"items"`
}

type Item struct {
	ID         int            `db:"id"`
	UserID     string         `db:"user_id"`
	MerchantID int            `db:"merchant_id"`
	ReceiptID  int            `db:"receipt_id"`
	Name       string         `db:"name"`
	Price      string         `db:"price"`
	CreatedAt  string         `db:"created_at"`
	UpdatedAt  string         `db:"updated_at"`
	Notes      sql.NullString `db:"notes"`
}

type RawReceipt struct {
	Merchant string             `json:"merchant"`
	Date     string             `json:"date"`
	Total    string             `json:"total"`
	Items    []RawPurchasedItem `json:"items"`
}

type RawPurchasedItem struct {
	Name  string `json:"name"`
	Price string `json:"price"`
}

type RawImageWithReceipt struct {
	RawReceipt
	Image string `json:"image"`
}

func GetReceiptById(id string) (*Receipt, error) {
	db := utils.Db()

	query := `
		SELECT r.id, r.total, r.date, r.created_at, r.updated_at, r.notes, m.name,
			   pi.id, pi.user_id, pi.merchant_id, pi.receipt_id, pi.name, pi.price, pi.created_at, pi.updated_at, pi.notes
		FROM receipts r
		JOIN merchants m ON r.merchant_id = m.id
		LEFT JOIN purchased_items pi ON r.id = pi.receipt_id
		WHERE r.id = ?
	`

	rows, err := db.Query(query, id)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var receipt Receipt
	receipt.Items = []Item{}

	for rows.Next() {
		var item Item
		err := rows.Scan(&receipt.ID, &receipt.Total, &receipt.Date, &receipt.CreatedAt, &receipt.UpdatedAt, &receipt.Notes, &receipt.Merchant,
			&item.ID, &item.UserID, &item.MerchantID, &item.ReceiptID, &item.Name, &item.Price, &item.CreatedAt, &item.UpdatedAt, &item.Notes)
		if err != nil {
			return nil, err
		}
		receipt.Items = append(receipt.Items, item)
	}

	return &receipt, nil
}

func GetReceipts(userID interface{}, page, records string) ([]Receipt, int, error) {
	db := utils.Db()

	query := `
		SELECT receipts.id, receipts.total, receipts.date, receipts.created_at, receipts.updated_at, receipts.notes, merchants.name FROM receipts
		JOIN merchants ON receipts.merchant_id = merchants.id
		WHERE receipts.user_id = ?
		LIMIT ? OFFSET ?
	`

	countQuery := `
		SELECT COUNT(*) FROM receipts
		WHERE user_id = ?
	`

	offset, err := strconv.Atoi(page)
	if err != nil {
		return nil, 0, fmt.Errorf("invalid page number: %v", err)
	}
	pageSizeInt, err := strconv.Atoi(records)
	if err != nil {
		return nil, 0, fmt.Errorf("invalid page size: %v", err)
	}
	offset = (offset - 1) * pageSizeInt

	rows, err := db.Query(query, userID, pageSizeInt, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	receipts := []Receipt{}

	for rows.Next() {
		var receipt Receipt
		err := rows.Scan(&receipt.ID, &receipt.Total, &receipt.Date, &receipt.CreatedAt, &receipt.UpdatedAt, &receipt.Notes, &receipt.Merchant)
		if err != nil {
			return nil, 0, err
		}
		receipts = append(receipts, receipt)
	}

	var totalRecords int
	err = db.QueryRow(countQuery, userID).Scan(&totalRecords)
	if err != nil {
		return nil, 0, err
	}

	return receipts, totalRecords, nil
}

func InsertMerchant(merchant string) (int, error) {
	db := utils.Db()

	// First, check if the merchant already exists
	var id int
	err := db.QueryRow("SELECT id FROM merchants WHERE name = ?", merchant).Scan(&id)
	if err == nil {
		// Merchant exists, update the updated_at field
		_, err = db.Exec("UPDATE merchants SET updated_at = ? WHERE id = ?", time.Now(), id)
		if err != nil {
			return 0, err
		}
		return id, nil
	} else if err != sql.ErrNoRows {
		// An error occurred other than "no rows found"
		return 0, err
	}

	// Merchant doesn't exist, insert a new one
	stmt, err := db.Prepare("INSERT INTO merchants (name, created_at, updated_at) VALUES (?, ?, ?)")
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	res, err := stmt.Exec(merchant, time.Now(), time.Now())
	if err != nil {
		return 0, err
	}

	id64, err := res.LastInsertId()
	if err != nil {
		return 0, err
	}

	return int(id64), nil
}

func InsertReceipt(c *gin.Context, receipt RawReceipt, merchantId int) (int, error) {
	db := utils.Db()

	session := utils.GetSession(c)
	userID := session.Get("user_id")

	stmt, err := db.Prepare("INSERT INTO receipts (user_id, merchant_id, total, date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)")
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	res, err := stmt.Exec(userID, merchantId, receipt.Total, receipt.Date, time.Now(), time.Now())
	if err != nil {
		return 0, err
	}

	id64, err := res.LastInsertId()
	if err != nil {
		return 0, err
	}

	return int(id64), nil
}

func InsertPurchasedItem(c *gin.Context, purchasedItem RawPurchasedItem, merchantId int, receiptId int) (int, error) {
	db := utils.Db()

	session := utils.GetSession(c)
	userID := session.Get("user_id")

	stmt, err := db.Prepare("INSERT INTO purchased_items (user_id, merchant_id, receipt_id, name, price, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	res, err := stmt.Exec(userID, merchantId, receiptId, purchasedItem.Name, purchasedItem.Price, time.Now(), time.Now())
	if err != nil {
		return 0, err
	}

	id64, err := res.LastInsertId()
	if err != nil {
		return 0, err
	}

	return int(id64), nil
}

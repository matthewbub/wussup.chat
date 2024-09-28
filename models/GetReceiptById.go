package models

import (
	"database/sql"

	"bus.zcauldron.com/utils"
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
	UserID     int            `db:"user_id"`
	MerchantID int            `db:"merchant_id"`
	ReceiptID  int            `db:"receipt_id"`
	Name       string         `db:"name"`
	Price      string         `db:"price"`
	CreatedAt  string         `db:"created_at"`
	UpdatedAt  string         `db:"updated_at"`
	Notes      sql.NullString `db:"notes"`
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

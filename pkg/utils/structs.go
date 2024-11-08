package utils

import "database/sql"

type UserObject struct {
	ID                        string
	Username                  string
	Email                     string
	SecurityQuestionsAnswered bool
}

type UserWithRole struct {
	UserObject
	Password                   string
	ApplicationEnvironmentRole string
	InactiveAt                 sql.NullTime
}

type ReceiptParseResult struct {
	Merchant string            `json:"merchant"`
	Date     string            `json:"date"`
	Total    string            `json:"total"`
	Items    []ReceiptItemJSON `json:"items"`
}

type ReceiptItemJSON struct {
	Name  string `json:"name"`
	Price string `json:"price"`
}

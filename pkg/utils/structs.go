package utils

type UserObject struct {
	ID                        string
	Username                  string
	Email                     string
	SecurityQuestionsAnswered bool
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

type ReceiptWithImage struct {
	Receipt ReceiptParseResult
	Image   string `json:"image"`
}

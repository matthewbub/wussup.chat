package utils

import (
	"strconv"
	"strings"
)

// FormatCurrency converts a string representation of currency to int64 (cents)
// Handles various formats including "$1,234.56", "1,234.56", "1234.56", "$1234", etc.
// Returns 0 for empty or invalid inputs
func FormatCurrency(amount string) int64 {
	if amount == "" || amount == "nil" {
		return 0
	}

	// Remove "$" and "," characters
	amount = strings.Replace(amount, "$", "", -1)
	amount = strings.Replace(amount, ",", "", -1)

	// Split the string into dollars and cents
	parts := strings.Split(amount, ".")

	var dollars, cents int64
	var err error

	// Parse dollars
	dollars, err = strconv.ParseInt(parts[0], 10, 64)
	if err != nil {
		return 0
	}

	// Parse cents if present
	if len(parts) > 1 {
		centStr := parts[1]
		if len(centStr) > 2 {
			centStr = centStr[:2]
		} else if len(centStr) == 1 {
			centStr += "0"
		}
		cents, err = strconv.ParseInt(centStr, 10, 64)
		if err != nil {
			return 0
		}
	}

	// Combine dollars and cents
	return dollars*100 + cents
}

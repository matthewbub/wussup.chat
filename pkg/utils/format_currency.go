package utils

import (
	"errors"
	"fmt"
	"strconv"
	"strings"
)

// FormatCurrency converts a string representation of currency to int64 (cents)
// Handles various formats including "$1,234.56", "1,234.56", "1234.56", "$1234", etc.
// Returns 0 for empty or invalid inputs
func FormatCurrency(amount string) (int64, error) {
	if amount == "" || amount == "nil" {
		return 0, errors.New("empty or invalid amount")
	}

	// Remove "$" and "," characters
	amount = strings.Replace(amount, "$", "", -1)
	amount = strings.Replace(amount, ",", "", -1)

	// Check if there are multiple decimal points
	if strings.Count(amount, ".") > 1 {
		return 0, errors.New("invalid currency format: multiple decimal points")
	}

	// Split the string into dollars and cents
	parts := strings.Split(amount, ".")

	var dollars, cents int64
	var err error

	// Parse dollars
	dollars, err = strconv.ParseInt(parts[0], 10, 64)
	if err != nil {
		return 0, errors.New("unable to parse currency")
	}

	// Parse cents if present
	if len(parts) > 1 {
		centStr := parts[1]
		if len(centStr) > 2 {
			centStr = centStr[:2] // truncate to two decimal places
		} else if len(centStr) == 1 {
			centStr += "0" // append zero if only one digit in cents
		}
		cents, err = strconv.ParseInt(centStr, 10, 64)
		if err != nil {
			return 0, errors.New("unable to parse currency")
		}
	}

	// Combine dollars and cents into total amount in cents
	totalAmount := dollars*100 + cents

	// Ensure that the total falls within the SQL DECIMAL(15, 2) range
	// Max value for DECIMAL(15, 2) is 99999999999999 cents (1 trillion - 0.01)
	if totalAmount > 99999999999999 {
		return 0, errors.New("amount exceeds the maximum allowed value")
	}

	if totalAmount < 0 {
		return 0, errors.New("do not use negative values")
	}

	return totalAmount, nil
}

func FormatCentsToUSD(cents int64) string {
	// Divide cents by 100 to get dollar value
	dollars := float64(cents) / 100
	return fmt.Sprintf("$%.2f", dollars)
}

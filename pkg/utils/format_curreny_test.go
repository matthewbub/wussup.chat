package utils

import (
	"log"
	"testing"
)

func TestFormatCurrency(t *testing.T) {
	tests := []struct {
		input    string
		expected int64
		hasError bool
	}{
		// Valid cases
		{"$2,234.56", 223456, false},
		{"3,567.89", 356789, false},
		{"5234.12", 523412, false},
		{"$2232", 223200, false},
		{"1534", 153400, false},
		{"$0.99", 99, false},
		{"0.77", 77, false},
		{"$0.01", 1, false},
		{"36.00", 3600, false},
		{"$36.50", 3650, false},
		{"0.00", 0, false},

		// Edge cases
		{"", 0, true},    // empty string
		{"nil", 0, true}, // "nil" input
		{"$999,999,999,999.99", 99999999999999, false}, // max possible value
		{"$1,000,000,000,000.00", 0, true},             // exceeds max value
		{"$-823.45", 0, true},                          // negative value not handled
		{"143.456", 14345, false},                      // more than two decimal places, should truncate
		{"113.7", 11370, false},                        // one decimal place, should append a zero

		// Invalid cases
		{"abc", 0, true},       // invalid string
		{"$16abc.45", 0, true}, // partially invalid string
		{"12.abc", 0, true},    // invalid decimal part
		{"12.24.56", 0, true},  // multiple decimals
	}

	for _, test := range tests {
		t.Run(test.input, func(t *testing.T) {
			result, err := FormatCurrency(test.input)

			if (err != nil) != test.hasError {
				t.Errorf("Error for input %s: got %v, expected error = %v", test.input, err, test.hasError)
			}

			if result != test.expected {
				t.Errorf("Unexpected result for input %s: got %v, expected %v", test.input, result, test.expected)
			}

			log.Printf("Input: %s | Result: %v | Expected: %v\n", test.input, result, test.expected)
		})
	}
}

func TestFormatCentsToUSD(t *testing.T) {
	tests := []struct {
		cents    int64
		expected string
	}{
		// Standard cases
		{3600, "$36.00"},     // Regular positive value
		{123456, "$1234.56"}, // Larger positive value
		{99, "$0.99"},        // Cents only
		{1, "$0.01"},         // Minimum non-zero value
		{0, "$0.00"},         // Zero value

		// Edge cases
		{99999999999999, "$999999999999.99"}, // Max allowed value (SQL DECIMAL(15,2) limit)
		{-1234, "$-12.34"},                   // Negative value
		{-1, "$-0.01"},                       // Small negative value
	}

	for _, test := range tests {
		t.Run(test.expected, func(t *testing.T) {
			result := FormatCentsToUSD(test.cents)
			if result != test.expected {
				t.Errorf("unexpected result for %d cents: got %v, expected %v", test.cents, result, test.expected)
			}
		})
	}
}

package utils

import (
	"fmt"
	"log"
	"strings"
	"time"
)

// FormatDate takes a string that is expected to be a date and returns it in MM/DD/YYYY format.
// If the input cannot be parsed as a date, it returns an empty string and an error.
func FormatDate(inputDate string) (string, error) {
	// List of common date formats to try
	formats := []string{
		"2006-01-02",
		"01/02/2006",
		"1/2/2006",
		"Jan 2, 2006",
		"January 2, 2006",
		"2 Jan 2006",
		"2 January 2006",
		"02 Jan 2006",
		"02 January 2006",
	}

	// Try to parse the input string using each format
	for _, format := range formats {
		if t, err := time.Parse(format, strings.TrimSpace(inputDate)); err == nil {
			return t.Format("01/02/2006"), nil
		}
	}

	log.Printf("unable to parse date: %s", inputDate)
	// If none of the formats work, return an error
	return "", fmt.Errorf("unable to parse date: %s", inputDate)
}

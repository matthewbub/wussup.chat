package main

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
)

// GenerateAndPrintBase64Key generates a random byte slice of the specified length,
// encodes it to a base64 string, and prints it
func GenerateAndPrintBase64Key(length int) error {
	bytes := make([]byte, length)
	_, err := rand.Read(bytes)
	if err != nil {
		return err
	}
	encoded := base64.StdEncoding.EncodeToString(bytes)
	fmt.Println("Generated base64 key:", encoded)
	return nil
}

func main() {
	GenerateAndPrintBase64Key(32)
}

package utils

import (
	"encoding/base64"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
)

func init() {
	// Load .env file if it exists
	godotenv.Load()
}

func GetSecretKeyFromEnv() []byte {
	key := os.Getenv("SESSION_SECRET_KEY")
	if key == "" {
		log.Fatal("SESSION_SECRET_KEY environment variable is not set")
	}
	decoded, err := base64.StdEncoding.DecodeString(key)
	if err != nil {
		log.Fatal("Failed to decode SESSION_SECRET_KEY:", err)
	}
	return decoded
}

func GetEnv() string {
	env := os.Getenv("ENV")
	if env == "" {
		log.Printf("ENV environment variable is not set")
	}
	return env
}

func ValidateEnvironment() error {
	env := GetEnv()
	if env == "" {
		return fmt.Errorf("ENV is not set")
	}
	if env != "production" && env != "development" && env != "test" {
		return fmt.Errorf("ENV is not valid")
	}
	// Add other environment checks here
	return nil
}

func SetTestEnvironment() error {
	testKey := os.Getenv("TEST_SESSION_SECRET_KEY")
	if testKey == "" {
		return fmt.Errorf("TEST_SESSION_SECRET_KEY is not set")
	}

	// validate the test key format
	if _, err := base64.StdEncoding.DecodeString(testKey); err != nil {
		return fmt.Errorf("invalid TEST_SESSION_SECRET_KEY format: %w", err)
	}

	os.Setenv("ENV", "test")
	os.Setenv("SESSION_SECRET_KEY", testKey)
	return nil
}

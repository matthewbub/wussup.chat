package utils

import (
	"encoding/base64"
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

package main

import (
	"log"
	"os"
	"strings"
)

func main() {
	cwd, err := os.Getwd()
	if err != nil {
		log.Fatalf("Failed to get current working directory: %v", err)
	}

	filePath := cwd + "/dist/index.html"
	content, err := os.ReadFile(filePath)
	if err != nil {
		log.Fatalf("Failed to read file: %v", err)
	}

	// Define the replacement HTML
	replacementHTML := `<link rel="stylesheet" href="/styles/theme.css" />
	<link rel="stylesheet" href="/styles/main.css" />
	<link rel="stylesheet" href="/styles/htmx.css" />
	<link rel="stylesheet" href="/styles/print.css" />`

	// Replace the <!-- THIS COMMENT IS RESERVED FOR A BUILD STEP (DO NOT REMOVE) --> string
	newContent := strings.Replace(string(content), "<!-- THIS COMMENT IS RESERVED FOR A BUILD STEP (DO NOT REMOVE) -->", replacementHTML, 1)

	// Write the new content back to the file
	err = os.WriteFile(filePath, []byte(newContent), 0644)
	if err != nil {
		log.Fatalf("Failed to write file: %v", err)
	}

	log.Println("Replacement complete.")
}

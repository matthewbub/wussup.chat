package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type PythonResponse struct {
	Success bool   `json:"success"`
	Text    string `json:"text"`
	Error   string `json:"error"`
}

type Transaction struct {
	Date        string  `json:"date"`
	Description string  `json:"description"`
	Amount      float64 `json:"amount"`
	Type        string  `json:"type"`
}

type StatementData struct {
	Transactions []Transaction `json:"transactions"`
}

type PDFPageCount struct {
	NumPages int    `json:"numPages"`
	FileID   string `json:"fileId"`
}

var tempFiles = make(map[string]string)

func ExtractPDFText(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(400, gin.H{"error": "No file uploaded"})
		return
	}
	pagesStr := c.PostForm("pages")

	tmpDir, err := os.MkdirTemp("", "pdf_processing")
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to create temp directory"})
		return
	}
	defer os.RemoveAll(tmpDir)

	pdfPath := filepath.Join(tmpDir, "statement.pdf")
	if err := c.SaveUploadedFile(file, pdfPath); err != nil {
		c.JSON(500, gin.H{"error": "Failed to save file"})
		return
	}

	var pages []int
	for _, p := range strings.Split(pagesStr, ",") {
		page, err := strconv.Atoi(strings.TrimSpace(p))
		if err != nil {
			c.JSON(400, gin.H{"error": "Invalid page number"})
			return
		}
		pages = append(pages, page)
	}

	extractedText := ""

	// Run Python script for each page
	for _, page := range pages {
		cmd := exec.Command("python3", "scripts/pdf_extractor.py", pdfPath, strconv.Itoa(page))
		output, err := cmd.Output()
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to process PDF: " + err.Error()})
			return
		}

		// Parse the JSON response from Python
		var response PythonResponse
		if err := json.Unmarshal(output, &response); err != nil {
			c.JSON(500, gin.H{"error": "Failed to parse Python output"})
			return
		}

		if !response.Success {
			c.JSON(500, gin.H{"error": response.Error})
			return
		}

		extractedText += response.Text
	}

	// Define the JSON schema for the response
	jsonSchema := map[string]interface{}{
		"type": "object",
		"properties": map[string]interface{}{
			"transactions": map[string]interface{}{
				"type": "array",
				"items": map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"date":        map[string]interface{}{"type": "string"},
						"description": map[string]interface{}{"type": "string"},
						"amount":      map[string]interface{}{"type": "number"},
						"type": map[string]interface{}{
							"type": "string",
							"enum": []string{"credit", "debit"},
						},
					},
					"required":             []string{"date", "description", "amount", "type"},
					"additionalProperties": false,
				},
			},
		},
		"required":             []string{"transactions"},
		"additionalProperties": false,
	}
	// Prepare OpenAI request with the extracted text
	payload := map[string]interface{}{
		"model": "gpt-4o",
		"messages": []map[string]interface{}{
			{
				"role": "user",
				"content": fmt.Sprintf(
					"Please extract the following information from this bank statement text: "+
						"account number, bank name, statement date, and all transactions. "+
						"For each transaction:\n"+
						"1. Convert all currency amounts to positive numbers with exactly 2 decimal places (e.g., '$14.99' or '-$14.99' should become 14.99, '$0.3' should become 0.30)\n"+
						"2. Mark the transaction type as 'debit' for expenses/withdrawals and 'credit' for deposits/incoming funds\n"+
						"Format the response according to the schema. Here's the text:\n\n%s",
					extractedText,
				),
			},
		},
		"temperature": 0.7,
		"max_tokens":  16384,
		"response_format": map[string]interface{}{
			"type": "json_schema",
			"json_schema": map[string]interface{}{
				"name":   "receipt_response",
				"schema": jsonSchema,
				"strict": true,
			},
		},
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to marshal payload"})
		return
	}

	// Send the request to OpenAI API
	req, err := http.NewRequest("POST", "https://api.openai.com/v1/chat/completions", bytes.NewBuffer(payloadBytes))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create request"})
		return
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+os.Getenv("OPENAI_API_KEY"))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send request"})
		return
	}
	defer resp.Body.Close()

	// Read the response
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read response"})
		return
	}

	// Unmarshal the OpenAI API response
	var openAIResp struct {
		Model string `json:"model"`
		Usage struct {
			PromptTokens     int `json:"prompt_tokens"`
			CompletionTokens int `json:"completion_tokens"`
			TotalTokens      int `json:"total_tokens"`
		} `json:"usage"`
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}

	if err := json.Unmarshal(respBody, &openAIResp); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse OpenAI response"})
		return
	}

	var statement StatementData
	if err := json.Unmarshal([]byte(openAIResp.Choices[0].Message.Content), &statement); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse statement data"})
		return
	}

	// Print page count
	fmt.Println("Page count:", pages)

	c.JSON(200, statement)
}

func GetPDFPageCount(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(400, gin.H{"error": "No file uploaded"})
		return
	}

	// Create a temporary directory for the uploaded file
	tmpDir, err := os.MkdirTemp("", "pdf_processing")
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to create temp directory"})
		return
	}

	// Save the uploaded file
	pdfPath := filepath.Join(tmpDir, "statement.pdf")
	if err := c.SaveUploadedFile(file, pdfPath); err != nil {
		c.JSON(500, gin.H{"error": "Failed to save file"})
		return
	}

	// Run Python script to get page count
	cmd := exec.Command("python3", "scripts/pdf_page_count.py", pdfPath)
	output, err := cmd.Output()
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to process PDF: " + err.Error()})
		return
	}

	var response struct {
		NumPages int `json:"numPages"`
	}
	if err := json.Unmarshal(output, &response); err != nil {
		c.JSON(500, gin.H{"error": "Failed to parse Python output"})
		return
	}

	// Generate a unique ID for this file
	fileID := uuid.New().String()

	// Store the temp directory path (you might want to use Redis or similar in production)
	// For now, we'll use an in-memory map
	tempFiles[fileID] = tmpDir

	c.JSON(200, PDFPageCount{
		NumPages: response.NumPages,
		FileID:   fileID,
	})
}

func SaveStatement(c *gin.Context) {
	tokenString, err := c.Cookie("jwt")
	if err != nil || tokenString == "" {
		c.JSON(401, gin.H{"error": "Unauthorized"})
		return
	}

	userID, _, err := utils.VerifyJWT(tokenString)
	if err != nil {
		c.JSON(401, gin.H{"error": "Unauthorized"})
		return
	}

	// Dump JSON body to file
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		fmt.Println(err)
		c.JSON(500, gin.H{"error": "Failed to read request body"})
		return
	}

	type Statement struct {
		Transactions []Transaction `json:"transactions"`
	}

	var statement Statement
	err = json.Unmarshal(body, &statement)

	if err != nil {
		fmt.Println(err)
		c.JSON(500, gin.H{"error": "Failed to parse statement data"})
		return
	}

	db := utils.GetDB()
	tx, err := db.Begin()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
		return
	}

	defer tx.Rollback()

	stmt, err := tx.Prepare("INSERT INTO transactions (id, user_id, date, description, amount, type) VALUES (?, ?, ?, ?, ?, ?)")

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to prepare statement"})
		return
	}

	defer stmt.Close()

	// Insert each transaction
	for _, t := range statement.Transactions {
		// Parse date string to timestamp
		date, err := parseDate(t.Date)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
			return
		}

		_, err = stmt.Exec(
			uuid.New().String(),
			userID,
			date,
			t.Description,
			t.Amount,
			t.Type,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save transaction"})
			return
		}
	}

	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("Successfully saved %d transactions", len(statement.Transactions)),
	})
}

func parseDate(dateStr string) (time.Time, error) {
	// Try parsing with different layouts
	layouts := []string{
		"1/2/2006",   // for single digit month/day
		"01/02/2006", // for double digit month/day
	}

	var parseErr error
	for _, layout := range layouts {
		t, err := time.Parse(layout, dateStr)
		if err == nil {
			return t, nil
		}
		parseErr = err
	}
	return time.Time{}, parseErr
}

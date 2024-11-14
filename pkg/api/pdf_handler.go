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

	"github.com/gin-gonic/gin"
)

type PythonResponse struct {
	Success bool   `json:"success"`
	Text    string `json:"text"`
	Error   string `json:"error"`
}

type Transaction struct {
	Date        string `json:"date"`
	Description string `json:"description"`
	Amount      string `json:"amount"`
	Type        string `json:"type"`
}

type StatementData struct {
	AccountNumber string        `json:"accountNumber"`
	BankName      string        `json:"bankName"`
	StatementDate string        `json:"statementDate"`
	Transactions  []Transaction `json:"transactions"`
}

func ExtractPDFText(c *gin.Context) {
	// Get the uploaded file
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
	defer os.RemoveAll(tmpDir) // Clean up after we're done

	// Save the uploaded file
	pdfPath := filepath.Join(tmpDir, "statement.pdf")
	if err := c.SaveUploadedFile(file, pdfPath); err != nil {
		c.JSON(500, gin.H{"error": "Failed to save file"})
		return
	}

	// Run Python script
	cmd := exec.Command("python3", "scripts/pdf_extractor.py", pdfPath)
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
	// Define the JSON schema for the response
	jsonSchema := map[string]interface{}{
		"type": "object",
		"properties": map[string]interface{}{
			"accountNumber": map[string]interface{}{
				"type": "string",
			},
			"bankName": map[string]interface{}{
				"type": "string",
			},
			"statementDate": map[string]interface{}{
				"type": "string",
			},
			"transactions": map[string]interface{}{
				"type": "array",
				"items": map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"date": map[string]interface{}{
							"type": "string",
						},
						"description": map[string]interface{}{
							"type": "string",
						},
						"amount": map[string]interface{}{
							"type": "string",
						},
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
		"required":             []string{"accountNumber", "bankName", "statementDate", "transactions"},
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
						"Format the response according to the schema. Here's the text:\n\n%s",
					response.Text,
				),
			},
		},
		"temperature": 0.7,
		"max_tokens":  16384,
		// "response_format": map[string]interface{}{
		// 	"type": "json_object",
		// },
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

	fmt.Println(string(respBody))

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

	fmt.Println(openAIResp)

	if err := json.Unmarshal(respBody, &openAIResp); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse OpenAI response"})
		return
	}

	// Parse the content into your statement structure
	var statement StatementData
	if err := json.Unmarshal([]byte(openAIResp.Choices[0].Message.Content), &statement); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse statement data"})
		return
	}

	c.JSON(200, statement)
}

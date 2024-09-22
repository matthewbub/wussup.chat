package api

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"html/template"
	"io"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

type Receipt struct {
	Merchant string `json:"merchant"`
	Date     string `json:"date"`
	Total    string `json:"total"`
	Items    []struct {
		Name       string  `json:"name"`
		Price      string  `json:"price"`
		Confidence float64 `json:"confidence"`
	} `json:"items"`
}

// UploadHandler handles the receipt upload and parsing
// It takes an image file, sends it to OpenAI for parsing, and returns the results
func UploadHandler(c *gin.Context) {
	// get the img file from the form
	imgFile, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No image file provided"})
		return
	}

	log.Println(imgFile.Filename)

	// Open the uploaded file
	file, err := imgFile.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open image file"})
		return
	}
	defer file.Close()

	// Read the file content
	fileBytes, err := io.ReadAll(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read image file"})
		return
	}

	// Encode the file content to base64
	base64Image := base64.StdEncoding.EncodeToString(fileBytes)
	// Define the JSON schema for the response
	jsonSchema := map[string]interface{}{
		"type": "object",
		"properties": map[string]interface{}{
			"merchant": map[string]interface{}{
				"type": "string",
			},
			"date": map[string]interface{}{
				"type": "string",
			},
			"total": map[string]interface{}{
				"type": "string",
			},
			"items": map[string]interface{}{
				"type": "array",
				"items": map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"name": map[string]interface{}{
							"type": "string",
						},
						"price": map[string]interface{}{
							"type": "string",
						},
						"confidence": map[string]interface{}{
							"type": "number",
						},
					},
					"required":             []string{"name", "price", "confidence"},
					"additionalProperties": false,
				},
			},
		},
		"required":             []string{"merchant", "date", "total", "items"},
		"additionalProperties": false,
	}

	// Prepare the request payload
	payload := map[string]interface{}{
		"model": "gpt-4o-mini",
		"messages": []map[string]interface{}{
			{
				"role": "user",
				"content": []map[string]interface{}{
					{
						"type": "text",
						"text": "Please extract the merchant name, date, total amount, and list of items with their names and prices from this receipt image. Consider the list of items may not always have prices listed, such as napkins or condiments. Do not guess any information. If you cannot extract certain fields or if the image is not a receipt, return the same JSON format with those fields left empty. Please assess the confidence in your results by providing a score between 0 and 1 for each item's name and price. If there is doubt, return a confidence score of less than 0.7.",
					},
					{
						"type": "image_url",
						"image_url": map[string]string{
							"url": "data:image/jpeg;base64," + base64Image,
						},
					},
				},
			},
		},
		"max_tokens": 3000,
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

	// Check if the response contains the expected data
	if len(openAIResp.Choices) == 0 || openAIResp.Choices[0].Message.Content == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid response from OpenAI"})
		return
	}

	// Unmarshal the content field separately
	var receipt Receipt
	if err := json.Unmarshal([]byte(openAIResp.Choices[0].Message.Content), &receipt); err != nil {
		log.Printf("Error parsing receipt content: %v\n", err)
		log.Print("Last time this happened we weren't using enough tokens to get a full response and therefore were getting 50 percent of a JSON object.")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse receipt content"})
		return
	}

	// Load the template file
	tmpl, err := template.ParseFiles("templates/partials/receipt-parse-results.go.tmpl")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load template"})
		return
	}

	// Render the template with the response data
	var renderedHTML strings.Builder
	if err := tmpl.Execute(&renderedHTML, receipt); err != nil {
		log.Printf("Error rendering template: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to render template"})
		return
	}

	c.Header("Content-Type", "text/html")
	c.String(http.StatusOK, renderedHTML.String())

}

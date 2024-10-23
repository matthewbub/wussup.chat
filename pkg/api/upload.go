package api

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"bus.zcauldron.com/pkg/models"
	"bus.zcauldron.com/pkg/utils"
	"bus.zcauldron.com/pkg/views/partials"
	"github.com/gin-gonic/gin"
)

// UploadHandler handles the receipt upload and parsing
// It takes an image file, sends it to OpenAI for parsing, and returns the results
func UploadHandler(c *gin.Context) {
	// get the img file from the form
	imgFile, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No image file provided"})
		return
	}

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
					},
					"required":             []string{"name", "price"},
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
						"text": "Please extract the merchant name, date in the format MM/DD/YYYY, total amount, and list of items with their names and prices from this receipt image. " +
							"Consider quantities and prices per unit. Consider the list of items may not always have prices listed, such as napkins or condiments. " +
							"Do not guess any information. If you cannot extract certain fields or if the image is not a receipt, return the same JSON format with those fields left empty.",
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

	// Check if the response contains the expected data
	if len(openAIResp.Choices) == 0 || openAIResp.Choices[0].Message.Content == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid response from OpenAI"})
		return
	}

	_, err = models.InsertTokenUsage(c, openAIResp.Model, openAIResp.Usage.PromptTokens, openAIResp.Usage.CompletionTokens, openAIResp.Usage.TotalTokens)
	if err != nil {
		log.Printf("Error inserting token usage: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert token usage"})
		return
	}

	// Unmarshal the content field separately
	var receipt utils.ReceiptParseResult
	if err := json.Unmarshal([]byte(openAIResp.Choices[0].Message.Content), &receipt); err != nil {
		log.Printf("Error parsing receipt content: %v\n", err)
		log.Print("Last time this happened we weren't using enough tokens to get a full response and therefore were getting 50 percent of a JSON object.")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse receipt content"})
		return
	}

	// format the total and each item's price to two decimal places
	if receipt.Total != "" {
		receipt.Total = fmt.Sprintf("%.2f", float64(utils.FormatCurrency(receipt.Total))/100)
	}

	if len(receipt.Items) > 0 {
		for i := range receipt.Items {
			receipt.Items[i].Price = fmt.Sprintf("%.2f", float64(utils.FormatCurrency(receipt.Items[i].Price))/100)
		}
	}

	// log.Printf("Receipt: %+v\n", receipt)

	imageWithReceipt := utils.ReceiptWithImage{
		Image:   base64Image,
		Receipt: receipt,
	}

	// Load the template file
	component := partials.ReceiptManualEdit(imageWithReceipt)
	component.Render(context.Background(), c.Writer)
}

func UploadHandlerButInJson(c *gin.Context) {
	// get the img file from the form
	imgFile, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No image file provided"})
		return
	}

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
					},
					"required":             []string{"name", "price"},
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
						"text": "Please extract the merchant name, date in the format MM/DD/YYYY, total amount, and list of items with their names and prices from this receipt image. " +
							"Consider quantities and prices per unit. Consider the list of items may not always have prices listed, such as napkins or condiments. " +
							"Do not guess any information. If you cannot extract certain fields or if the image is not a receipt, return the same JSON format with those fields left empty.",
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

	// Check if the response contains the expected data
	if len(openAIResp.Choices) == 0 || openAIResp.Choices[0].Message.Content == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid response from OpenAI"})
		return
	}

	_, err = models.InsertTokenUsage(c, openAIResp.Model, openAIResp.Usage.PromptTokens, openAIResp.Usage.CompletionTokens, openAIResp.Usage.TotalTokens)
	if err != nil {
		log.Printf("Error inserting token usage: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert token usage"})
		return
	}

	// Unmarshal the content field separately
	var receipt utils.ReceiptParseResult
	if err := json.Unmarshal([]byte(openAIResp.Choices[0].Message.Content), &receipt); err != nil {
		log.Printf("Error parsing receipt content: %v\n", err)
		log.Print("Last time this happened we weren't using enough tokens to get a full response and therefore were getting 50 percent of a JSON object.")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse receipt content"})
		return
	}

	// format the total and each item's price to two decimal places
	if receipt.Total != "" {
		receipt.Total = fmt.Sprintf("%.2f", float64(utils.FormatCurrency(receipt.Total))/100)
	}

	if len(receipt.Items) > 0 {
		for i := range receipt.Items {
			receipt.Items[i].Price = fmt.Sprintf("%.2f", float64(utils.FormatCurrency(receipt.Items[i].Price))/100)
		}
	}

	// log.Printf("Receipt: %+v\n", receipt)

	imageWithReceipt := utils.ReceiptWithImage{
		Image:   base64Image,
		Receipt: receipt,
	}

	// Load the template file
	// component := partials.ReceiptManualEdit(imageWithReceipt)
	// component.Render(context.Background(), c.Writer)

	c.JSON(http.StatusOK, imageWithReceipt)
}

func ManualUploadHandler(c *gin.Context) {
	// Load the template file
	component := partials.ReceiptManualEdit(utils.ReceiptWithImage{})
	component.Render(context.Background(), c.Writer)
}

func UploadConfirmHandler(c *gin.Context) {
	// dump the form data
	// Parse the form data
	if err := c.Request.ParseForm(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse form data"})
		return
	}

	data := map[string]string{
		"image":    utils.SanitizeInput(c.PostForm("zcauldron_c_image")),
		"merchant": utils.SanitizeInput(c.PostForm("zcauldron_c_merchant")),
		"date":     utils.SanitizeInput(c.PostForm("zcauldron_c_date")),
		"total":    utils.SanitizeInput(c.PostForm("zcauldron_c_total")),
	}

	if data["date"] == "" {
		data["date"] = time.Now().Format("10/08/2024")
	}

	// TODO implement this - right now there are some wonky dates that are breaking the app,
	// 	this might be a non problem when we roll the db

	// else {
	// 	date, err := utils.FormatDate(data["date"])
	// 	if err != nil {
	// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse date"})
	// 		return
	// 	}
	// 	data["date"] = date
	// }

	if data["total"] == "" {
		data["total"] = "0.00"
	}

	// Extract form data into a structured format
	receipt := models.RawReceipt{
		Image:    data["image"],
		Merchant: data["merchant"],
		Date:     data["date"],
		Total:    data["total"],
	}

	// Create a map to store the item names by index
	itemNames := make(map[string]string)

	// First pass: collect item names
	for key := range c.Request.Form {
		if strings.HasPrefix(key, "name___") {
			index := strings.TrimPrefix(key, "name___")
			itemNames[index] = c.PostForm(key)
		}
	}

	// Second pass: process items with prices
	for key := range c.Request.Form {
		if strings.HasPrefix(key, "price___") {
			index := strings.TrimPrefix(key, "price___")
			itemPrice := c.PostForm(key)
			receipt.Items = append(receipt.Items, models.RawPurchasedItem{
				Name:  itemNames[index],
				Price: fmt.Sprintf("%.2f", float64(utils.FormatCurrency(itemPrice))/100),
			})
		}
	}

	component := partials.ReceiptConfirmation(models.RawReceipt(receipt))
	err := component.Render(context.Background(), c.Writer)
	if err != nil {
		log.Printf("Something went wrong rendering the template")
		return
	}
}

func SaveReceiptHandler(c *gin.Context) {
	// TODO sanitize the receipt data
	// TODO assume all prices are one of the following formats: $1.00, 1.00, 1, "invalid" and parse accordingly
	var receipt models.RawReceipt

	// Parse the JSON payload
	if err := c.ShouldBindJSON(&receipt); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON payload"})
		return
	}

	log.Printf("Receipt recieved: %+v\n", receipt)

	// When a user adds a receipt we need to create a merchant if it doesn't exist,
	// we need to create a new receipt,
	// and then use the ID from both of those to add the receipt items
	merchantId, err := models.InsertMerchant(receipt.Merchant)
	if err != nil || merchantId == 0 {
		log.Printf("Error inserting merchant: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert merchant"})
		return
	}

	receiptId, err := models.InsertReceipt(c, receipt, merchantId)
	if err != nil || receiptId == 0 {
		log.Printf("Error inserting receipt: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert receipt"})
		return
	}

	for _, item := range receipt.Items {
		rawPurchasedItem := models.RawPurchasedItem{
			Name:  item.Name,
			Price: fmt.Sprintf("%.2f", float64(utils.FormatCurrency(item.Price))/100),
		}
		_, err := models.InsertPurchasedItem(c, rawPurchasedItem, merchantId, receiptId)
		if err != nil {
			log.Printf("Error inserting purchased item: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert purchased item"})
			return
		}
	}

	err = models.InsertReceiptImageIntoDatabase(c, receipt, receiptId)
	if err != nil {
		log.Printf("Error inserting image into database: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert image into database"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Receipt saved successfully", "success": true})
}

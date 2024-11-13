package api

import (
	"encoding/json"
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

	c.JSON(200, gin.H{
		"text": response.Text,
	})
}

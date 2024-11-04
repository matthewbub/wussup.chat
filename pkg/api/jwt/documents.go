package jwt

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Document management endpoints

// GetDocument retrieves a single document and its sheets
func GetDocument(c *gin.Context) {
	// GET /api/v1/documents/:id
	// Response: {
	//   id: string,
	//   title: string,
	//   sheets: [{
	//     id: string,
	//     label: string,
	//     content: string,
	//     orderIndex: number
	//   }]
	// }
	c.JSON(http.StatusOK, gin.H{"message": "Document retrieved", "ok": true})
}

// CreateDocument creates a new document
func CreateDocument(c *gin.Context) {
	// POST /api/v1/documents
	// Request body: {
	//   title: string,
	//   sheets: [{
	//     label: string,
	//     content: string
	//   }]
	// }
	c.JSON(http.StatusOK, gin.H{"message": "Document created", "ok": true})
}

// UpdateDocument updates document title and/or sheets
func UpdateDocument(c *gin.Context) {
	// PUT /api/v1/documents/:id
	// Request body: {
	//   title?: string,
	//   sheets?: [{
	//     id?: string,
	//     label: string,
	//     content: string,
	//     orderIndex: number
	//   }]
	// }
	c.JSON(http.StatusOK, gin.H{"message": "Document updated", "ok": true})
}

// DeleteDocument permanently deletes a document
func DeleteDocument(c *gin.Context) {
	// DELETE /api/v1/documents/:id
	c.JSON(http.StatusOK, gin.H{"message": "Document deleted", "ok": true})
}

// ListDocuments retrieves all documents for the user
func ListDocuments(c *gin.Context) {
	// GET /api/v1/documents
	// Query params: page, limit
	// Response: {
	//   documents: [{
	//     id: string,
	//     title: string,
	//     updatedAt: string,
	//     sheetCount: number
	//   }],
	//   totalCount: number
	// }
	c.JSON(http.StatusOK, gin.H{"message": "Documents retrieved", "ok": true})
}

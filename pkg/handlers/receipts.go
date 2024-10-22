package handlers

import (
	"log"
	"net/http"
	"os"
	"path/filepath"

	"bus.zcauldron.com/pkg/utils"
	"bus.zcauldron.com/pkg/views"
	"github.com/a-h/templ"
	"github.com/gin-gonic/gin"
)

func ReceiptsView(c *gin.Context) {
	_, err := utils.GetUserFromSession(c)
	if err != nil {
		log.Println(err)
		c.Redirect(http.StatusSeeOther, "/login")
		return
	}

	templ.Handler(views.ReceiptUploadForm(views.ReceiptUploadFormData{
		Title:      "Upload Receipts",
		IsLoggedIn: true,
	})).ServeHTTP(c.Writer, c.Request)
}

func ReceiptsV2View(c *gin.Context) {
	cwd, err := os.Getwd()
	if err != nil {
		log.Fatal("Error getting current working directory:", err)
	}

	appPath := filepath.Join(cwd, "website", "dist", "index.html")

	// Serve the React app's index.html file
	c.File(appPath)
}

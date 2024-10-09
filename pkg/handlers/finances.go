package handlers

import (
	"log"
	"net/http"
	"strconv"

	"bus.zcauldron.com/pkg/models"
	"bus.zcauldron.com/pkg/utils"
	"bus.zcauldron.com/pkg/views"
	"github.com/a-h/templ"
	"github.com/gin-gonic/gin"
)

func FinancesView(c *gin.Context) {
	user, err := utils.GetUserFromSession(c)
	if err != nil {
		log.Println(err)
		c.Redirect(http.StatusSeeOther, "/login")
		return
	}

	// get query params
	query := c.Request.URL.Query()
	page := query.Get("page")
	if page == "" {
		page = "1"
	}
	records := query.Get("records")
	if records == "" {
		records = "10"
	}

	receipts, totalRecords, err := models.GetReceipts(user.ID, page, records)
	if err != nil {
		log.Println(err)
		// TODO improve error handling
		// c.Redirect(http.StatusSeeOther, "/dashboard")
		return
	}

	currentPage, _ := strconv.Atoi(page)
	recordsPerPage, _ := strconv.Atoi(records)
	totalPages := (totalRecords + recordsPerPage - 1) / recordsPerPage

	templ.Handler(views.Finances(views.FinancesData{
		Title:      "Finances",
		IsLoggedIn: true,
		Receipts:   receipts,
		Pagination: views.PaginationData{
			CurrentPage:    currentPage,
			NextPage:       currentPage + 1,
			PreviousPage:   currentPage - 1,
			TotalRecords:   totalRecords,
			TotalPages:     totalPages,
			RecordsPerPage: recordsPerPage,
		},
	})).ServeHTTP(c.Writer, c.Request)
}

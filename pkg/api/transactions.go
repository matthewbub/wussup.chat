package api

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"time"

	"bus.zcauldron.com/pkg/api/response"
	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-gonic/gin"
)

type TransactionFromDatabase struct {
	ID          string    `json:"id"`
	UserID      string    `json:"user_id"`
	Date        time.Time `json:"date"`
	Description string    `json:"description"`
	Amount      float64   `json:"amount"`
	Type        string    `json:"type"`
	CreatedAt   time.Time `json:"created_at"`
}

func GetUserTransactionsHandler(c *gin.Context) {
	// Retrieve JWT token from cookies
	tokenString, err := c.Cookie("jwt")
	if err != nil || tokenString == "" {
		c.JSON(http.StatusUnauthorized, response.Error(
			"User not authenticated",
			response.AUTHENTICATION_FAILED,
		))
		return
	}

	// Verify the JWT and extract user ID
	userID, _, err := utils.VerifyJWT(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, response.Error(
			"Invalid token",
			response.AUTHENTICATION_FAILED,
		))
		return
	}

	// Get transactions from database
	transactions, err := GetUserTransactions(userID, utils.GetDB())
	if err != nil {
		log.Printf("Error getting transactions: %v", err)
		c.JSON(http.StatusInternalServerError, response.Error(
			"Failed to retrieve transactions",
			response.OPERATION_FAILED,
		))
		return
	}

	c.JSON(http.StatusOK, response.Success(
		gin.H{"transactions": transactions},
		"Transactions retrieved successfully",
	))
}

func GetUserTransactions(userID string, db *sql.DB) ([]TransactionFromDatabase, error) {
	query := `
        SELECT id, user_id, date, description, amount, type, created_at 
        FROM transactions 
        WHERE user_id = $1 
        ORDER BY date DESC`

	rows, err := db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("error querying transactions: %w", err)
	}
	defer rows.Close()

	var transactions []TransactionFromDatabase
	for rows.Next() {
		var t TransactionFromDatabase
		err := rows.Scan(
			&t.ID,
			&t.UserID,
			&t.Date,
			&t.Description,
			&t.Amount,
			&t.Type,
			&t.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning transaction: %w", err)
		}
		transactions = append(transactions, t)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating transactions: %w", err)
	}

	return transactions, nil
}

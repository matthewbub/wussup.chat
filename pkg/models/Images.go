package models

import (
	"fmt"
	"log"
	"time"

	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func InsertReceiptImageIntoDatabase(c *gin.Context, rawReceipt RawReceipt, receiptID int) error {
	db := utils.Db()
	defer db.Close()

	if rawReceipt.Image == "" {
		return nil
	}

	user, err := utils.GetUserFromSession(c)
	if err != nil {
		return fmt.Errorf("failed to get user from session: %w", err)
	}

	stmt, err := db.Prepare("INSERT INTO receipt_blobs (id, user_id, receipt_id, img_blob, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)")
	if err != nil {
		log.Println(err)
		return fmt.Errorf("failed to prepare statement: %w", err)
	}

	_, err = stmt.Exec(uuid.New().String(), user.ID, receiptID, rawReceipt.Image, time.Now(), time.Now())
	if err != nil {
		log.Println(err)
		return fmt.Errorf("failed to execute statement: %w", err)
	}

	return nil
}

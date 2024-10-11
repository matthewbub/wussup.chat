package models

import (
	"time"

	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-gonic/gin"
)

func InsertTokenUsage(c *gin.Context, model string, promptTokens int, completionTokens int, totalTokens int) (int, error) {
	db := utils.Db()

	session := utils.GetSession(c)
	userID := session.Get("user_id")

	stmt, err := db.Prepare("INSERT INTO token_usage (user_id, model, prompt_tokens, completion_tokens, total_tokens, created_at) VALUES (?, ?, ?, ?, ?, ?)")
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	res, err := stmt.Exec(userID, model, promptTokens, completionTokens, totalTokens, time.Now())
	if err != nil {
		return 0, err
	}

	id64, err := res.LastInsertId()
	if err != nil {
		return 0, err
	}

	return int(id64), nil
}

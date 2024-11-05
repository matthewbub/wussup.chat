package utils

import (
	"github.com/gin-gonic/gin"
)

type JsonResponse struct {
	Ok      bool
	Message string
	Data    interface{}
	Error   string
	Code    string
}

func JR(data JsonResponse) gin.H {
	return gin.H{
		"ok":      data.Ok,
		"message": data.Message,
		"data":    data.Data,
		"error":   data.Error,
		"code":    data.Code,
	}
}

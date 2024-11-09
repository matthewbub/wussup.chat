package response

import "github.com/gin-gonic/gin"

type Response[T any] struct {
	Ok      bool   `json:"ok"`
	Message string `json:"message"`
	Data    T      `json:"data,omitempty"`
	Error   string `json:"error,omitempty"`
	Code    string `json:"code,omitempty"`
}

// Success response helper
func Success[T any](data T, message string) gin.H {
	return gin.H{
		"ok":      true,
		"message": message,
		"data":    data,
	}
}

func SuccessMessage(message string) gin.H {
	return gin.H{
		"ok":      true,
		"message": message,
	}
}

// Error response helper
func Error(message string, code string) gin.H {
	return gin.H{
		"ok":      false,
		"message": message,
		"code":    code,
	}
}

// Usage example:
// func ExampleHandler(c *gin.Context) {
// 	type UserData struct {
// 		ID       string `json:"id"`
// 		Username string `json:"username"`
// 	}

// 	// Success case
// 	userData := UserData{ID: "123", Username: "john"}
// 	c.JSON(200, Success(userData, "User retrieved successfully"))

// 	// Error case
// 	c.JSON(400, Error("Invalid request", "INVALID_REQUEST", "Username is required"))
// }

package response

import (
	"github.com/gin-gonic/gin"
)

type Response[T any] struct {
	Ok      bool   `json:"ok" jsonschema:"description=Indicates if the request was successful"`
	Message string `json:"message" jsonschema:"description=Human-readable message about the response"`
	Data    T      `json:"data,omitempty" jsonschema:"description=The response payload"`
	Error   string `json:"error,omitempty" jsonschema:"description=Error message when ok is false"`
	Code    string `json:"code,omitempty" jsonschema:"description=Error code for machine processing"`
}

type ErrorResponse struct {
	Response[any]
}

type EmptyResponse struct {
	Response[any]
}

// New creates a Response instance
func New[T any]() *Response[T] {
	return &Response[T]{
		Ok: true,
	}
}

// WithData adds data to the response
func (r *Response[T]) WithData(data T) *Response[T] {
	r.Data = data
	return r
}

// WithMessage adds a message to the response
func (r *Response[T]) WithMessage(message string) *Response[T] {
	r.Message = message
	return r
}

// WithError sets error details
func (r *Response[T]) WithError(message string, code string) *Response[T] {
	r.Ok = false
	r.Error = message
	r.Code = code
	return r
}

// ToGinH converts the response to gin.H (for backward compatibility)
func (r *Response[T]) ToGinH() gin.H {
	h := gin.H{
		"ok":      r.Ok,
		"message": r.Message,
	}
	h["data"] = r.Data
	if r.Error != "" {
		h["error"] = r.Error
	}
	if r.Code != "" {
		h["code"] = r.Code
	}
	return h
}

// Legacy helper functions (for backward compatibility)
func Success[T any](data T, message string) gin.H {
	return New[T]().
		WithData(data).
		WithMessage(message).
		ToGinH()
}

func SuccessMessage(message string) gin.H {
	return New[string]().
		WithMessage(message).
		ToGinH()
}

func Error(message string, code string) gin.H {
	return New[any]().
		WithError(message, code).
		ToGinH()
}

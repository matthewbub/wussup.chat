package test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func RegisterUserAtSignup(router *gin.Engine, t *testing.T) {
	signUpBody := map[string]interface{}{
		"email":           "test@example.com",
		"password":        "Password123!",
		"confirmPassword": "Password123!",
		"termsAccepted":   true,
		"username":        "testuser",
	}

	jsonBody, _ := json.Marshal(signUpBody)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/v1/public/sign-up", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	if w.Code != http.StatusOK {
		t.Logf("Response body: %s", w.Body.String())
	}
}

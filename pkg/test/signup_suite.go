package test

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func RegisterUserAtSignup(router *gin.Engine, t *testing.T) {
	username, email := GetNextUser()
	log.Printf("username: %s, email: %s", username, email)
	signUpBody := map[string]interface{}{
		"email":           email,
		"password":        TestConfig.Password,
		"confirmPassword": TestConfig.Password,
		"termsAccepted":   true,
		"username":        username,
	}

	log.Printf("signUpBody: %v", signUpBody)
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

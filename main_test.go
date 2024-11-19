package main

import (
	"testing"

	"bus.zcauldron.com/pkg/api"
	"bus.zcauldron.com/pkg/middleware"
	"bus.zcauldron.com/pkg/test"
	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
)

// setupTestRouter creates a test instance of your router
func setupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.Default()

	// Add necessary middleware
	router.Use(middleware.Cors)

	// Setup test session
	store := cookie.NewStore([]byte("test_secret"))
	router.Use(sessions.Sessions("session", store))
	router.Use(middleware.Recovery("Something went wrong"))

	// Add your routes
	publicRoutes := router.Group("/api/v1/public")
	{
		publicRoutes.POST("/sign-up", api.SignUpHandler)
	}

	return router
}

func TestMain(m *testing.M) {
	// Setup test environment
	utils.SetTestEnvironment()

	// Run migrations for test database
	// You might want to create a separate test database setup function
	runMigrations()

	// Run tests
	m.Run()
}

func TestSignUpEndpoint(t *testing.T) {
	router := setupTestRouter()

	// Test case: successful signup
	// t.Run("Successful SignUp", func(t *testing.T) {
	// 	signUpBody := map[string]interface{}{
	// 		"email":    "test@example.com",
	// 		"password": "password123",
	// 		"name":     "Test User",
	// 	}
	// 	jsonBody, _ := json.Marshal(signUpBody)

	// 	w := httptest.NewRecorder()
	// 	req, _ := http.NewRequest("POST", "/api/v1/public/sign-up", bytes.NewBuffer(jsonBody))
	// 	req.Header.Set("Content-Type", "application/json")

	// 	router.ServeHTTP(w, req)

	// 	assert.Equal(t, http.StatusOK, w.Code)
	// })

	// Test case: invalid signup (missing required fields)
	t.Run("Register user at signup", func(t *testing.T) {
		test.RegisterUserAtSignup(router, t)
	})
}

// func TestLoginEndpoint(t *testing.T) {
// 	router := setupTestRouter()

// 	// Test case: successful login
// 	t.Run("Successful Login", func(t *testing.T) {
// 		loginBody := map[string]interface{}{
// 			"email":    "test@example.com",
// 			"password": "password123",
// 		}
// 		jsonBody, _ := json.Marshal(loginBody)

// 		w := httptest.NewRecorder()
// 		req, _ := http.NewRequest("POST", "/api/v1/public/login", bytes.NewBuffer(jsonBody))
// 		req.Header.Set("Content-Type", "application/json")

// 		router.ServeHTTP(w, req)

// 		assert.Equal(t, http.StatusOK, w.Code)
// 	})

// 	// Test case: invalid credentials
// 	t.Run("Invalid Login", func(t *testing.T) {
// 		loginBody := map[string]interface{}{
// 			"email":    "test@example.com",
// 			"password": "wrongpassword",
// 		}
// 		jsonBody, _ := json.Marshal(loginBody)

// 		w := httptest.NewRecorder()
// 		req, _ := http.NewRequest("POST", "/api/v1/public/login", bytes.NewBuffer(jsonBody))
// 		req.Header.Set("Content-Type", "application/json")

// 		router.ServeHTTP(w, req)

// 		assert.Equal(t, http.StatusUnauthorized, w.Code)
// 	})
// }

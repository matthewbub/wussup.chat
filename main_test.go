package main

import (
	"os"
	"testing"

	"bus.zcauldron.com/pkg/api"
	"bus.zcauldron.com/pkg/middleware"
	"bus.zcauldron.com/pkg/test"
	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
)

func TestMain(m *testing.M) {
	utils.SetTestEnvironment()
	utils.RunMigrations()
	utils.RunMigrationsTest()
	m.Run()
	utils.DropTestDatabase()
}

func TestSignUpEndpoint(t *testing.T) {
	router := setupTestRouter()
	t.Run("Register user at signup", func(t *testing.T) {
		test.RegisterUserAtSignup(router, t)
	})
}

// setupTestRouter creates a test instance of your router
func setupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.Default()

	// middleware
	router.Use(middleware.Cors)

	// session management
	store := cookie.NewStore([]byte(os.Getenv("SESSION_SECRET_KEY")))
	router.Use(sessions.Sessions("session", store))
	router.Use(middleware.Recovery("Something went wrong"))

	// routes
	publicRoutes := router.Group("/api/v1/public")
	{
		publicRoutes.POST("/sign-up", api.SignUpHandler)
	}

	return router
}

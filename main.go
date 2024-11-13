package main

import (
	"log"
	"time"

	"bus.zcauldron.com/pkg/api"
	"bus.zcauldron.com/pkg/middleware"
	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
)

func main() {
	err := utils.ValidateEnvironment()
	if err != nil {
		log.Fatalf("Environment validation failed: %v", err)
	}

	router := gin.Default()
	router.Use(middleware.Cors)

	// React build assets
	router.Static("/_assets", "./router/dist/_assets")

	// session management
	secretKey := utils.GetSecretKeyFromEnv()
	store := cookie.NewStore(secretKey)
	router.Use(sessions.Sessions("session", store))
	router.Use(middleware.Recovery("Something went wrong"))

	// schema - keep me above other routes
	router.GET("/api/v1/schema/:type", api.SchemaHandler)

	publicRoutes := router.Group("/api/v1/public", middleware.RateLimit(5*time.Second))
	{
		publicRoutes.POST("/sign-up", api.SignUpHandler)
		publicRoutes.POST("/login", api.LoginHandler)
	}

	accountRoutes := router.Group("/api/v1/account", middleware.JWTAuthMiddleware())
	{
		accountRoutes.GET("/auth-check", api.AuthCheckHandler)
		accountRoutes.POST("/forgot-password", api.ForgotPasswordHandler)
		accountRoutes.POST("/security-questions", api.SecurityQuestionsHandler)
		accountRoutes.POST("/logout", api.LogoutHandler)
		accountRoutes.POST("/in/reset-password", api.AuthenticatedResetPasswordHandler)
		accountRoutes.POST("/profile", api.UpdateProfileHandler)
		accountRoutes.DELETE("/delete", api.DeleteAccountHandler)
	}

	router.GET("/api/v1/example/jwt", middleware.JWTAuthMiddleware(), api.ExampleAuthEndpoint)

	router.POST("/api/v1/pdf/extract", api.ExtractPDFText)

	//router.NoRoute(handlers.NotFound404)

	log.Println("Server is running on port 8080")
	err = router.Run(":8080")
	if err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}

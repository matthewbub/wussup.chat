package main

import (
	"log"

	"bus.zcauldron.com/pkg/api"
	"bus.zcauldron.com/pkg/api/jwt"
	"bus.zcauldron.com/pkg/middleware"
	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	router.Use(middleware.Cors)

	// React build assets
	router.Static("/_assets", "./router/dist/_assets")

	// session management
	secretKey := utils.GetSecretKeyFromEnv()
	store := cookie.NewStore(secretKey)
	router.Use(sessions.Sessions("session", store))
	router.Use(middleware.Recovery("Something went wrong"))

	router.POST("/api/v1/account/sign-up", api.SignUpHandler)
	router.POST("/api/v1/account/login", api.LoginHandler)
	router.POST("/api/v1/account/security-questions", middleware.JWTAuthMiddleware(), api.SecurityQuestionsHandler)
	router.POST("/api/v1/account/in/reset-password", middleware.JWTAuthMiddleware(), api.AuthenticatedResetPasswordHandler)

	router.POST("/api/v1/jwt/logout", jwt.Logout)
	router.POST("/api/v1/jwt/forgot-password", jwt.ForgotPasswordHandler)
	router.GET("/api/v1/jwt/auth-check", jwt.AuthCheckHandler)
	router.GET("/api/v1/example/jwt", middleware.JWTAuthMiddleware(), api.ExampleAuthEndpoint)

	router.POST("/api/v1/jwt/account/profile", middleware.JWTAuthMiddleware(), jwt.UpdateProfile)
	router.POST("/api/v1/account/security", middleware.JWTAuthMiddleware(), jwt.UpdateSecurity)
	router.POST("/api/v1/account/preferences", middleware.JWTAuthMiddleware(), jwt.UpdatePreferences)
	router.POST("/api/v1/account/export", middleware.JWTAuthMiddleware(), jwt.ExportData)
	router.DELETE("/api/v1/jwt/account", middleware.JWTAuthMiddleware(), jwt.DeleteAccount)

	//router.NoRoute(handlers.NotFound404)

	log.Println("Server is running on port 8080")
	err := router.Run(":8080")
	if err != nil {
		return
	}
}

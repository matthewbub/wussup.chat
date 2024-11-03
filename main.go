package main

import (
	"log"

	"bus.zcauldron.com/pkg/api"
	"bus.zcauldron.com/pkg/api/jwt"
	"bus.zcauldron.com/pkg/handlers"
	"bus.zcauldron.com/pkg/middleware"
	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	r.Use(middleware.Cors)

	// static files
	r.Static("/styles", "./public/styles")
	r.Static("/js", "./public/js")

	// React build assets
	r.Static("/_assets", "./website/dist/_assets")

	// session management
	secretKey := utils.GetSecretKeyFromEnv()
	store := cookie.NewStore([]byte(secretKey))
	r.Use(sessions.Sessions("session", store))
	r.Use(middleware.Recovery("Something went wrong"))

	// alllll routes
	registerPublicViews(r)
	registerPublicApiRoutes(r)
	registerPrivateViews(r)
	registerPrivateApiRoutes(r)
	registerJwtApiRoutes(r)

	r.NoRoute(handlers.NotFound404)

	log.Println("Server is running on port 8080")
	r.Run(":8080")
}

// These use Templ as a template engine
func registerPublicViews(router *gin.Engine) {
	router.GET("/", handlers.LandingView)
	router.GET("/login", handlers.LoginView)
	router.GET("/sign-up", handlers.SignUpView)
	router.GET("/sign-up/security-questions", handlers.SignUpSecurityQuestionsView)
	router.GET("/sign-up/success", handlers.SignUpSuccessView)
	router.GET("/forgot-password", handlers.ForgotPasswordView)
}

func registerPublicApiRoutes(router *gin.Engine) {
	router.POST("/login", api.LoginHandler)
	router.POST("/sign-up", api.SignUpHandler)
	router.POST("/api/sign-up/security-questions", api.SecurityQuestionsHandler)
	router.GET("/api/v1/invalidate-session", api.InvalidateSessionHandler)
}

func registerPrivateViews(router *gin.Engine) {
	router.GET("/dashboard", middleware.AuthRequired(), handlers.DashboardView)
	router.GET("/dashboard/finances", middleware.AuthRequired(), handlers.FinancesView)
	router.GET("/dashboard/finances/receipts", middleware.AuthRequired(), handlers.ReceiptsView)
	router.GET("/dashboard/finances/v2/receipts", middleware.AuthRequired(), handlers.ReceiptsV2View)
	router.GET("/dashboard/finances/receipts/:id", middleware.AuthRequired(), handlers.ReceiptView)
	router.GET("/dashboard/finances/receipts/:id/edit", middleware.AuthRequired(), handlers.EditReceiptView)
}

func registerPrivateApiRoutes(router *gin.Engine) {
	router.GET("/logout", middleware.AuthRequired(), api.LogoutHandler)
	router.DELETE("/api/v1/finances/receipts/delete", middleware.AuthRequired(), api.DeleteReceipts)
	router.POST("/api/v1/finances/receipts/export", middleware.AuthRequired(), api.ExportReceipts)
	router.POST("/api/v1/finances/receipts/upload-image", middleware.AuthRequired(), api.UploadHandlerButInJson)
	router.POST("/api/v1/finances/receipts/upload", middleware.AuthRequired(), api.SaveReceiptHandler)
	router.GET("/api/v1/example/jwt", middleware.JWTAuthMiddleware(), api.ExampleAuthEndpoint)
	router.POST("/upload", middleware.AuthRequired(), api.UploadHandler)
	router.GET("/manual-upload", middleware.AuthRequired(), api.ManualUploadHandler)
	router.POST("/upload/confirm", middleware.AuthRequired(), api.UploadConfirmHandler)
	router.POST("/upload/confirm/save", middleware.AuthRequired(), api.SaveReceiptHandler)
}

// JWT API ROUTES
func registerJwtApiRoutes(router *gin.Engine) {
	router.POST("/api/v1/jwt/login", jwt.LoginWithJWTHandler)
	router.POST("/api/v1/jwt/logout", jwt.Logout)
	router.POST("/api/v1/jwt/forgot-password", jwt.ForgotPasswordHandler)
	router.GET("/api/v1/jwt/auth-check", jwt.AuthCheckHandler)
	router.POST("/api/v1/jwt/sign-up", jwt.SignUpHandler)
	router.POST("/api/v1/jwt/security-questions", middleware.JWTAuthMiddleware(), jwt.SecurityQuestionsHandler)
	router.POST("/api/v1/jwt/reset-password", middleware.JWTAuthMiddleware(), jwt.ResetPasswordHandler)
}

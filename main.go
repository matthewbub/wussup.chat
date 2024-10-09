package main

import (
	"log"

	"bus.zcauldron.com/pkg/api"
	"bus.zcauldron.com/pkg/handlers"
	"bus.zcauldron.com/pkg/middleware"
	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// Set trusted proxies
	r.SetTrustedProxies(nil)

	// session management
	secretKey := utils.GetSecretKeyFromEnv()
	store := cookie.NewStore([]byte(secretKey))
	r.Use(sessions.Sessions("session", store))

	// static files
	r.Static("/styles", "./public/styles")
	r.Static("/js", "./public/js")

	// alllll routes
	registerPublicViews(r)
	registerPublicApiRoutes(r)

	auth := r.Group("/")
	auth.Use(middleware.AuthRequired())
	auth.Use(middleware.SecurityQuestionsRequired())
	{
		registerPrivateViews(auth)
		registerPrivateApiRoutes(auth)
	}

	log.Println("Server is running on port http://localhost:8080")
	r.Run(":8080")
}

func registerPublicViews(router *gin.Engine) {
	router.GET("/", handlers.LandingView)
	router.GET("/login", handlers.LoginView)
	router.GET("/sign-up", handlers.SignUpView)
	router.GET("/sign-up/security-questions", handlers.SignUpSecurityQuestionsView)
	router.GET("/sign-up/success", handlers.SignUpSuccessView)
	router.GET("/forgot-password", handlers.ForgotPasswordView)
}

func registerPublicApiRoutes(r *gin.Engine) {
	r.POST("/login", api.LoginHandler)
	r.POST("/sign-up", api.SignUpHandler)
	r.POST("/api/sign-up/security-questions", api.SecurityQuestionsHandler)
	// r.POST("/forgot-password", forgotPasswordHandler)
}

func registerPrivateViews(auth *gin.RouterGroup) {
	auth.GET("/dashboard", handlers.DashboardView)
	auth.GET("/dashboard/finances", handlers.FinancesView)
	auth.GET("/dashboard/finances/:id", handlers.ReceiptView)
	auth.GET("/dashboard/finances/receipts", handlers.ReceiptsView)
}

func registerPrivateApiRoutes(auth *gin.RouterGroup) {
	auth.POST("/upload", api.UploadHandler)
	auth.POST("/upload/confirm", api.UploadConfirmHandler)
	auth.POST("/upload/confirm/save", api.SaveReceiptHandler)
	auth.GET("/logout", api.LogoutHandler)
}

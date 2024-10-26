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

	auth := r.Group("/")
	auth.Use(middleware.AuthRequired())
	auth.Use(middleware.Recovery("Something went wrong"))
	// auth.Use(middleware.SecurityQuestionsRequired())

	registerPrivateViews(auth)
	registerPrivateApiRoutes(auth)
	r.NoRoute(func(c *gin.Context) {
		log.Printf("404 Not Found: %s %s", c.Request.Method, c.Request.URL.Path)
		c.JSON(404, gin.H{"message": "Not Found"})
	})

	log.Println("Server is running on port 8080")
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
	r.POST("/api/v1/public/login", api.LoginHandler)
	r.POST("/sign-up", api.SignUpHandler)
	r.POST("/api/sign-up/security-questions", api.SecurityQuestionsHandler)

	r.GET("/api/v1/invalidate-session", api.InvalidateSessionHandler)
}

func registerPrivateViews(auth *gin.RouterGroup) {
	auth.GET("/dashboard", handlers.DashboardView)
	auth.GET("/dashboard/finances", handlers.FinancesView)
	auth.GET("/dashboard/finances/receipts", handlers.ReceiptsView)
	auth.GET("/dashboard/finances/v2/receipts", handlers.ReceiptsV2View)
	auth.GET("/dashboard/finances/receipts/:id", handlers.ReceiptView)
	auth.GET("/dashboard/finances/receipts/:id/edit", handlers.EditReceiptView)
}

func registerPrivateApiRoutes(auth *gin.RouterGroup) {
	auth.GET("/logout", api.LogoutHandler)
	auth.DELETE("/api/v1/finances/receipts/delete", api.DeleteReceipts)
	auth.POST("/api/v1/finances/receipts/export", api.ExportReceipts)
	auth.POST("/api/v1/finances/receipts/upload-image", api.UploadHandlerButInJson)
	auth.POST("/api/v1/finances/receipts/upload", api.SaveReceiptHandler)

	// @deprecated
	auth.POST("/upload", api.UploadHandler)
	auth.GET("/manual-upload", api.ManualUploadHandler)
	auth.POST("/upload/confirm", api.UploadConfirmHandler)
	auth.POST("/upload/confirm/save", api.SaveReceiptHandler)
}

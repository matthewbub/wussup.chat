package main

import (
	"log"
	"strconv"

	"bus.zcauldron.com/pkg/api"
	"bus.zcauldron.com/pkg/constants"
	"bus.zcauldron.com/pkg/handlers"
	"bus.zcauldron.com/pkg/middleware"
	"bus.zcauldron.com/pkg/utils"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	env := utils.GetEnv()
	r.Use(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		allowedOrigins := []string{
			"https://" + constants.AppConfig.ProductionDomain,
		}

		// log.Println("Origin:", origin)
		// log.Println("GO_ENV:", env)
		// log.Println("Allowed origins:", allowedOrigins)
		// if utils.ContainsOrigin(allowedOrigins, origin) {
		// 	log.Println("Allowed origin matched:", origin)
		// 	// CORS headers
		// } else {
		// 	log.Println("Blocked origin:", origin)
		// 	// c.AbortWithStatus(401)
		// 	// return
		// }

		if env == "development" {
			allowedOrigins = append(allowedOrigins, "http://"+constants.AppConfig.DevelopmentDomain+":"+strconv.Itoa(constants.AppConfig.DevelopmentPorts.Frontend))
			allowedOrigins = append(allowedOrigins, "http://"+constants.AppConfig.DevelopmentDomain+":"+strconv.Itoa(constants.AppConfig.DevelopmentPorts.Backend))
		}

		if origin == "" || utils.ContainsOrigin(allowedOrigins, origin) {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
			c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
			c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

			if c.Request.Method == "OPTIONS" {
				c.AbortWithStatus(204)
				return
			}
		} else {
			c.AbortWithStatus(401)
			return
		}

		c.Next()
	})

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

	// auth := r.Group("/")
	// auth.Use(middleware.AuthRequired())
	r.Use(middleware.Recovery("Something went wrong"))
	// auth.Use(middleware.SecurityQuestionsRequired())

	registerPrivateViews(r)
	registerPrivateApiRoutes(r)
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

func registerPublicApiRoutes(router *gin.Engine) {
	router.POST("/login", api.LoginHandler)
	router.POST("/sign-up", api.SignUpHandler)
	router.POST("/api/sign-up/security-questions", api.SecurityQuestionsHandler)

	router.GET("/api/v1/invalidate-session", api.InvalidateSessionHandler)
	router.POST("/api/v1/login/jwt", api.LoginWithJWTHandler)
	router.POST("/api/v1/security-questions/jwt", api.JWTSecurityQuestionsHandler)
	router.POST("/api/v1/logout/jwt", api.JWTLogout)
	router.POST("/api/v1/sign-up/jwt", api.JwtSignUpHandler)
	router.GET("/api/v1/auth-check/jwt", api.JWTAuthCheckHandler)
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

	// @deprecated
	router.POST("/upload", middleware.AuthRequired(), api.UploadHandler)
	router.GET("/manual-upload", middleware.AuthRequired(), api.ManualUploadHandler)
	router.POST("/upload/confirm", middleware.AuthRequired(), api.UploadConfirmHandler)
	router.POST("/upload/confirm/save", middleware.AuthRequired(), api.SaveReceiptHandler)
}

package main

import (
	"log"
	"net/http"

	"bus.zcauldron.com/models"
	"bus.zcauldron.com/routes/views"
	"bus.zcauldron.com/utils"
	"github.com/a-h/templ"
	"github.com/gin-gonic/gin"
)

type PageData struct {
	Title        string
	IsLoggedIn   bool
	CurrentUser  *utils.UserObject
	CurrentEmail string
	Message      string
}

func registerPublicViews(router *gin.Engine) {
	router.GET("/", handleLandingView)
	router.GET("/login", handleLoginView)
	router.GET("/sign-up", handleSignUpView)
	router.GET("/sign-up/security-questions", handleSignUpSecurityQuestionsView)
	router.GET("/forgot-password", forgotPasswordViewHandler)
}

func registerPrivateViews(auth *gin.RouterGroup) {
	auth.GET("/dashboard", handleDashboardView)
	auth.GET("/dashboard/receipts", handleReceiptsView)
	auth.GET("/dashboard/receipts/:id", handleReceiptView)
}

// HANDLERS
func handleLandingView(c *gin.Context) {
	// TODO improve user auth behavior
	// If logged in, redirect to dashboard
	templ.Handler(views.Landing(views.LandingData{
		Title: "Landing",
		// TODO why is this here
		Name:       "World",
		IsLoggedIn: false,
		// TODO this was a test message
		Message: "Welcome to the login page",
	})).ServeHTTP(c.Writer, c.Request)
}

func handleLoginView(c *gin.Context) {
	// TODO improve user auth behavior
	// If logged in, redirect to dashboard
	templ.Handler(views.LogIn(views.LogInData{
		Title:      "Login",
		Name:       "World",
		IsLoggedIn: false,
		Message:    "Welcome to the login page",
	})).ServeHTTP(c.Writer, c.Request)
}

func handleSignUpView(c *gin.Context) {
	// TODO improve user auth behavior
	// If logged in, redirect to dashboard
	templ.Handler(views.SignUp(views.SignUpData{
		Title:      "Sign Up",
		Name:       "World",
		IsLoggedIn: false,
		Message:    "Welcome to the sign up page",
	})).ServeHTTP(c.Writer, c.Request)
}

func forgotPasswordViewHandler(c *gin.Context) {
	templ.Handler(views.ForgotPassword(views.ForgotPasswordData{
		Title:      "Forgot Password",
		Name:       "World",
		IsLoggedIn: false,
		Message:    "Welcome to the forgot password page",
	})).ServeHTTP(c.Writer, c.Request)
}

func handleSignUpSecurityQuestionsView(c *gin.Context) {
	templ.Handler(views.SecurityQuestions(views.SecurityQuestionsData{
		Title:   "Security Questions",
		Message: "Please answer the following security questions",
	})).ServeHTTP(c.Writer, c.Request)
}

func handleDashboardView(c *gin.Context) {
	user, err := utils.GetUserFromSession(c)
	if err != nil {
		log.Println(err)
		c.Redirect(http.StatusSeeOther, "/login")
		return
	}

	templ.Handler(views.Dashboard(views.DashboardData{
		Title:      "Dashboard",
		Name:       user.Username,
		IsLoggedIn: true,
		Message:    "Welcome to the dashboard",
	})).ServeHTTP(c.Writer, c.Request)
}

func handleReceiptsView(c *gin.Context) {
	user, err := utils.GetUserFromSession(c)
	if err != nil {
		log.Println(err)
		c.Redirect(http.StatusSeeOther, "/login")
		return
	}

	receipts, err := models.GetReceipts(user.ID)
	if err != nil {
		log.Println(err)
		// TODO improve error handling
		c.Redirect(http.StatusSeeOther, "/dashboard")
		return
	}

	templ.Handler(views.Receipts(views.ReceiptsData{
		Title:      "Receipts",
		IsLoggedIn: true,
		Receipts:   receipts,
	})).ServeHTTP(c.Writer, c.Request)
}

func handleReceiptView(c *gin.Context) {
	user, err := utils.GetUserFromSession(c)
	if err != nil {
		log.Println(err)
		c.Redirect(http.StatusSeeOther, "/login")
		return
	}

	receiptID := c.Param("id")
	if receiptID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Receipt ID is required"})
		return
	}

	receipt, err := models.GetReceiptById(receiptID)

	if err != nil {
		log.Println(err)
		return
	}

	templ.Handler(views.ReceiptView(views.ReceiptViewData{
		Title:      "ZCauldron Receipt",
		IsLoggedIn: true,
		User:       &utils.UserObject{ID: user.ID, Username: user.Username, Email: user.Email},
		Email:      user.Email,
		Message:    "Welcome to the receipt",
		Receipt:    *receipt,
	})).ServeHTTP(c.Writer, c.Request)
}

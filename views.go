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
	router.GET("/", landingViewHandler)
	router.GET("/login", func(c *gin.Context) {
		// TODO improve user auth behavior
		// If logged in, redirect to dashboard
		templ.Handler(views.LogIn(views.LogInData{
			Title:      "Login",
			Name:       "World",
			IsLoggedIn: false,
			Message:    "Welcome to the login page",
		})).ServeHTTP(c.Writer, c.Request)
	})
	router.GET("/sign-up", func(c *gin.Context) {
		// TODO improve user auth behavior
		// If logged in, redirect to dashboard
		templ.Handler(views.SignUp(views.SignUpData{
			Title:      "Sign Up",
			Name:       "World",
			IsLoggedIn: false,
			Message:    "Welcome to the sign up page",
		})).ServeHTTP(c.Writer, c.Request)
	})
	router.GET("/forgot-password", forgotPasswordViewHandler)
}

func registerPrivateViews(auth *gin.RouterGroup) {
	auth.GET("/dashboard", func(c *gin.Context) {
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
	})
	auth.GET("/dashboard/receipts", func(c *gin.Context) {
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
	})
	auth.GET("/dashboard/receipts/:id", func(c *gin.Context) {
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
	})
}

func renderView(c *gin.Context, template string, title string) {
	var isLoggedIn bool
	user, err := utils.GetUserFromSession(c)
	if err != nil {
		isLoggedIn = false
	} else {
		isLoggedIn = true
	}

	c.HTML(http.StatusOK, template, PageData{
		Title:      title,
		IsLoggedIn: isLoggedIn,
		CurrentUser: func() *utils.UserObject {
			if user != nil {
				return &utils.UserObject{
					ID:       user.ID,
					Username: user.Username,
					Email:    user.Email,
				}
			}
			return nil
		}(),
		CurrentEmail: func() string {
			if user != nil {
				return user.Email
			}
			return ""
		}(),
		Message: "",
	})
}

func landingViewHandler(c *gin.Context) {
	renderView(c, "landing.go.tmpl", "ZCauldron Landing")
}

func forgotPasswordViewHandler(c *gin.Context) {
	renderView(c, "forgot-password.go.tmpl", "ZCauldron Forgot Password")
}

package main

import (
	"net/http"

	"bus.zcauldron.com/utils"
	"github.com/gin-gonic/gin"
)

type UserInViews struct {
	ID       int
	Username string
	Email    string
}

type PageData struct {
	Title        string
	IsLoggedIn   bool
	CurrentUser  *UserInViews
	CurrentEmail string
	Message      string
}

func registerPublicViews(r *gin.Engine) {
	r.GET("/", landingViewHandler)
	r.GET("/login", loginViewHandler)
	r.GET("/sign-up", signUpViewHandler)
	r.GET("/forgot-password", forgotPasswordViewHandler)
	r.GET("/privacy-policy", privacyPolicyViewHandler)
	r.GET("/terms-of-service", termsOfServiceViewHandler)
	r.GET("/business-ideas", businessIdeasViewHandler)
}

func registerPrivateViews(auth *gin.RouterGroup) {
	auth.GET("/dashboard", dashboardViewHandler)
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
		CurrentUser: func() *UserInViews {
			if user != nil {
				return &UserInViews{
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

func loginViewHandler(c *gin.Context) {
	renderView(c, "login.tmpl", "ZCauldron Login")
}

func signUpViewHandler(c *gin.Context) {
	renderView(c, "sign-up.tmpl", "ZCauldron Sign up")
}

func forgotPasswordViewHandler(c *gin.Context) {
	renderView(c, "forgot-password.tmpl", "ZCauldron Forgot Password")
}

func privacyPolicyViewHandler(c *gin.Context) {
	renderView(c, "privacy-policy.tmpl", "ZCauldron Privacy Policy")
}

func termsOfServiceViewHandler(c *gin.Context) {
	renderView(c, "terms-of-service.tmpl", "ZCauldron Terms of Service")
}

func businessIdeasViewHandler(c *gin.Context) {
	renderView(c, "business-ideas.tmpl", "ZCauldron Business Ideas")
}

func dashboardViewHandler(c *gin.Context) {
	renderView(c, "dashboard.go.tmpl", "ZCauldron Dashboard")
}

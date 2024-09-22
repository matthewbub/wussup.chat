package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

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

func landingViewHandler(c *gin.Context) {
	c.HTML(http.StatusOK, "landing.go.tmpl", gin.H{
		"title": "ZCauldron Landing",
	})
}

func loginViewHandler(c *gin.Context) {
	c.HTML(http.StatusOK, "login.tmpl", gin.H{
		"title": "ZCauldron Login",
	})
}

func signUpViewHandler(c *gin.Context) {
	c.HTML(http.StatusOK, "sign-up.tmpl", gin.H{
		"title": "ZCauldron Sign up",
	})
}

func forgotPasswordViewHandler(c *gin.Context) {
	c.HTML(http.StatusOK, "forgot-password.tmpl", gin.H{
		"title": "ZCauldron Forgot Password",
	})
}

func privacyPolicyViewHandler(c *gin.Context) {
	c.HTML(http.StatusOK, "privacy-policy.tmpl", gin.H{
		"title": "ZCauldron Privacy Policy",
	})
}

func termsOfServiceViewHandler(c *gin.Context) {
	c.HTML(http.StatusOK, "terms-of-service.tmpl", gin.H{
		"title": "ZCauldron Terms of Service",
	})
}

func businessIdeasViewHandler(c *gin.Context) {
	c.HTML(http.StatusOK, "business-ideas.tmpl", gin.H{
		"title": "ZCauldron Business Ideas",
	})
}

func dashboardViewHandler(c *gin.Context) {
	c.HTML(http.StatusOK, "dashboard.go.tmpl", gin.H{
		"title": "ZCauldron Dashboard",
	})
}

package main

import (
	"database/sql"
	"log"
	"net/http"
	"time"

	"bus.zcauldron.com/models"
	"bus.zcauldron.com/routes/views"
	"bus.zcauldron.com/utils"
	"github.com/a-h/templ"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

type UserInViews struct {
	ID       interface{}
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

type AuthPageData struct {
	Title        string
	IsLoggedIn   bool
	CurrentUser  *UserInViews
	CurrentEmail string
	Message      string
	Receipts     []Receipt
}

type Receipt struct {
	Date       string          `json:"date"`
	Total      string          `json:"total"`
	CreatedAt  time.Time       `json:"created_at"`
	UpdatedAt  time.Time       `json:"updated_at"`
	Notes      sql.NullString  `json:"notes"`
	ID         int             `json:"id"`
	UserID     int             `json:"user_id"`
	MerchantID int             `json:"merchant_id"`
	Merchant   string          `json:"merchant"`
	Items      []PurchasedItem `json:"items"`
}

type PurchasedItem struct {
	Name  string `json:"name"`
	Price string `json:"price"`
}

func registerPublicViews(r *gin.Engine) {
	r.GET("/", landingViewHandler)
	r.GET("/login", func(c *gin.Context) {
		// TODO improve user auth behavior
		// If logged in, redirect to dashboard
		templ.Handler(views.LogIn(views.LogInData{
			Title:      "Login",
			Name:       "World",
			IsLoggedIn: false,
			Message:    "Welcome to the login page",
		})).ServeHTTP(c.Writer, c.Request)
	})
	r.GET("/sign-up", func(c *gin.Context) {
		// TODO improve user auth behavior
		// If logged in, redirect to dashboard
		templ.Handler(views.SignUp(views.SignUpData{
			Title:      "Sign Up",
			Name:       "World",
			IsLoggedIn: false,
			Message:    "Welcome to the sign up page",
		})).ServeHTTP(c.Writer, c.Request)
	})
	r.GET("/forgot-password", forgotPasswordViewHandler)
	r.GET("/test", func(c *gin.Context) {
		user, err := utils.GetUserFromSession(c)
		if err != nil {
			log.Println(err)
		}

		templ.Handler(views.Hello(views.HelloData{
			Title:      "World",
			Name:       user.Username,
			IsLoggedIn: err == nil,
		})).ServeHTTP(c.Writer, c.Request)
	})
}

func registerPrivateViews(auth *gin.RouterGroup) {
	auth.GET("/dashboard", dashboardViewHandler)
	auth.GET("/dashboard/receipt", receiptViewHandler)
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

func renderAuthView(c *gin.Context, template string, data AuthPageData) {
	var isLoggedIn bool
	user, err := utils.GetUserFromSession(c)
	if err != nil {
		isLoggedIn = false
	} else {
		isLoggedIn = true
	}

	c.HTML(http.StatusOK, template, AuthPageData{
		Title:      data.Title,
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
		Message:  data.Message,
		Receipts: data.Receipts,
	})
}

func landingViewHandler(c *gin.Context) {
	renderView(c, "landing.go.tmpl", "ZCauldron Landing")
}

func loginViewHandler(c *gin.Context) {
	renderView(c, "login.go.tmpl", "ZCauldron Login")
}

func signUpViewHandler(c *gin.Context) {
	renderView(c, "sign-up.go.tmpl", "ZCauldron Sign up")
}

func forgotPasswordViewHandler(c *gin.Context) {
	renderView(c, "forgot-password.go.tmpl", "ZCauldron Forgot Password")
}

func privacyPolicyViewHandler(c *gin.Context) {
	renderView(c, "privacy-policy.go.tmpl", "ZCauldron Privacy Policy")
}

func termsOfServiceViewHandler(c *gin.Context) {
	renderView(c, "terms-of-service.go.tmpl", "ZCauldron Terms of Service")
}

func businessIdeasViewHandler(c *gin.Context) {
	renderView(c, "business-ideas.tmpl", "ZCauldron Business Ideas")
}

func dashboardViewHandler(c *gin.Context) {
	// get user from session
	session := sessions.Default(c)
	userID := session.Get("user_id")
	email := session.Get("email")
	username := session.Get("username")
	if userID == nil {
		c.Redirect(http.StatusSeeOther, "/login")
		return
	}

	// get receipts for user
	receipts, err := getReceiptsForUser(userID)
	if err != nil {
		log.Println(err)
		// c.Redirect(http.StatusSeeOther, "/login")
		return
	}

	renderAuthView(c, "dashboard.go.tmpl", AuthPageData{
		Title:        "ZCauldron Dashboard",
		IsLoggedIn:   true,
		CurrentUser:  &UserInViews{ID: userID, Username: username.(string), Email: email.(string)},
		CurrentEmail: email.(string),
		Message:      "Welcome to the dashboard",
		Receipts:     receipts,
	})
}

func getReceiptsForUser(userID interface{}) ([]Receipt, error) {
	db := utils.Db()

	query := `
		SELECT receipts.id, receipts.total, receipts.date, receipts.created_at, receipts.updated_at, receipts.notes, merchants.name FROM receipts
		JOIN merchants ON receipts.merchant_id = merchants.id
		WHERE receipts.user_id = ?
	`

	rows, err := db.Query(query, userID)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	receipts := []Receipt{}

	for rows.Next() {
		var receipt Receipt
		err := rows.Scan(&receipt.ID, &receipt.Total, &receipt.Date, &receipt.CreatedAt, &receipt.UpdatedAt, &receipt.Notes, &receipt.Merchant)
		if err != nil {
			return nil, err
		}
		receipts = append(receipts, receipt)
	}
	log.Println(receipts)
	return receipts, nil
}

type ReceiptPageData struct {
	Title      string
	IsLoggedIn bool
	User       *UserInViews
	Email      string
	Message    string
	Receipt    models.Receipt
}

func receiptViewHandler(c *gin.Context) {
	var isLoggedIn bool
	user, err := utils.GetUserFromSession(c)
	if err != nil {
		isLoggedIn = false
	} else {
		isLoggedIn = true
	}

	if err != nil {
		log.Println(err)
		c.Redirect(http.StatusSeeOther, "/login")
		return
	}

	receiptID := c.Query("id")
	if receiptID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Receipt ID is required"})
		return
	}

	receipt, err := models.GetReceiptById(receiptID)

	if err != nil {
		log.Println(err)
		// c.Redirect(http.StatusSeeOther, "/dashboard")
		return
	}

	template := "receipt.go.tmpl"

	c.HTML(http.StatusOK, template, ReceiptPageData{
		Title:      "ZCauldron Receipt",
		IsLoggedIn: isLoggedIn,
		User:       &UserInViews{ID: user.ID, Username: user.Username, Email: user.Email},
		Email:      user.Email,
		Message:    "Welcome to the receipt",
		Receipt:    *receipt,
	})
}

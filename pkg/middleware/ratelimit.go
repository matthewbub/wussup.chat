package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

var (
	requests = make(map[string]time.Time)
	mu       sync.Mutex
)

// RateLimit returns a middleware that limits requests to 1 per `duration` per IP
func RateLimit(duration time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()

		mu.Lock()
		lastRequest, exists := requests[ip]
		if exists && time.Since(lastRequest) < duration {
			mu.Unlock()
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "Too many requests. Please try again later.",
			})
			c.Abort()
			return
		}
		requests[ip] = time.Now()
		mu.Unlock()

		c.Next()
	}
}

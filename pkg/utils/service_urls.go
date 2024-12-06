package utils

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"bus.zcauldron.com/pkg/constants"
)

// GetPDFServiceURL returns the appropriate url for the pdf service based on environment
func GetPDFServiceURL() string {
	env := os.Getenv("ENV")

	// For staging/production (Docker environment)
	if env == constants.ENV_STAGING || env == constants.ENV_PRODUCTION {
		return "http://pdf-service:8082"
	}

	// For local development, try localhost first
	localURL := fmt.Sprintf("http://localhost:%d", constants.AppConfig.DevelopmentPorts.Backend+2)

	// Quick check if local PDF service is running
	client := http.Client{Timeout: 100 * time.Millisecond}
	_, err := client.Get(localURL + "/health")
	if err == nil {
		return localURL
	}

	// If local service isn't running, try Docker service name
	dockerURL := "http://pdf-service:8082"
	_, err = client.Get(dockerURL + "/health")
	if err == nil {
		return dockerURL
	}

	logger := GetLogger()
	logger.Printf("Could not determine PDF service URL - neither local nor Docker service is accessible")
	return localURL // Default to local URL even if not accessible
}

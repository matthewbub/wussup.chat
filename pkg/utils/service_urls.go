package utils

import (
	"fmt"
	"os"

	"bus.zcauldron.com/pkg/constants"
)

// GetPDFServiceURL returns the appropriate url for the pdf service based on environment
func GetPDFServiceURL() string {
	env := os.Getenv("ENV")
	if env == constants.ENV_STAGING || env == constants.ENV_PRODUCTION {
		return "http://pdf-service:8082"
	}
	if env == constants.ENV_DEVELOPMENT || env == constants.ENV_TEST {
		return fmt.Sprintf("http://localhost:%d", constants.AppConfig.DevelopmentPorts.Backend+2)
	}

	logger := GetLogger()
	logger.Printf("Could not determine PDF service URL")
	return ""
}

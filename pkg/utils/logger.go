package utils

import (
	"log"
	"os"
	"sync"
)

var (
	Logger *log.Logger
	once   sync.Once
)

// InitLogger initializes the logger to write to a file
func InitLogger() {
	once.Do(func() {
		logFile, err := os.OpenFile("app.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
		if err != nil {
			log.Fatal("Error opening log file:", err)
		}
		Logger = log.New(logFile, "", log.Ldate|log.Ltime|log.Lshortfile)
	})
}

// GetLogger returns the initialized logger
func GetLogger() *log.Logger {
	if Logger == nil {
		InitLogger()
	}
	return Logger
}

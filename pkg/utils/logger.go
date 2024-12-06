package utils

import (
	"io"
	"log"
	"os"
	"sync"
)

var (
	Logger *log.Logger
	once   sync.Once
)

// InitLogger initializes the logger to write to both stdout and a file
func InitLogger() {
	once.Do(func() {
		// create log file with append mode
		file, err := os.OpenFile("app.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
		if err != nil {
			log.Fatal("Failed to open log file:", err)
		}

		// use multiwriter to write to both stdout and file
		multiWriter := io.MultiWriter(os.Stdout, file)
		Logger = log.New(multiWriter, "", log.Ldate|log.Ltime|log.Lshortfile)
		Logger.Println("Logger initialized successfully")
	})
}

// GetLogger returns the initialized logger
func GetLogger() *log.Logger {
	if Logger == nil {
		InitLogger()
	}
	return Logger
}

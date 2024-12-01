package constants

import "time"

type Config struct {
	ProductionDomain  string
	StagingDomain     string
	DevelopmentDomain string
	TestDomain        string
	DevelopmentPorts  struct {
		Frontend int
		Backend  int

		// The staging port runs both the frontend and backend
		// in local dev, you have both servers running in isolation, and visit Config.DevelopmentPorts.Frontend to see the UI; & HTTP requests are made to Config.DevelopmentPorts.Backend
		// In staging, you have both servers running together, and visit Config.Staging_Port to see the UI; HTTP requests are made to Config.Staging_Port as well
		Staging_Port int
	}
	DefaultJWTExpiration time.Duration
	// TODO: Implement ExtendJWTExpiration
	// ExtendJWTExpiration  time.Duration

	// TODO: Implement SecondaryAuthType
	// SecondaryAuthType string
}

var AppConfig = Config{
	ProductionDomain:  "zcauldron.com",
	StagingDomain:     "localhost",
	DevelopmentDomain: "localhost",
	TestDomain:        "localhost",
	DevelopmentPorts: struct {
		Frontend     int
		Backend      int
		Staging_Port int
	}{
		Frontend:     3001,
		Backend:      8080,
		Staging_Port: 8080,
	},
	DefaultJWTExpiration: time.Minute * 30,

	// TODO: Implement ExtendJWTExpiration
	// ExtendJWTExpiration:  time.Hour * 24,

	// TODO: Implement SecondaryAuthType
	// SecondaryAuthType: "KBA", // KBA = Knowledge Based Authentication || MFA = Multi-Factor Authentication
}

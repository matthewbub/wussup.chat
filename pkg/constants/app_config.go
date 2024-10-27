package constants

import "time"

type Config struct {
	ProductionDomain  string
	DevelopmentDomain string
	DevelopmentPorts  struct {
		Frontend int
		Backend  int
	}
	DefaultJWTExpiration time.Duration
	// TODO: Implement ExtendJWTExpiration
	// ExtendJWTExpiration  time.Duration
}

var AppConfig = Config{
	ProductionDomain:  "zcauldron.com",
	DevelopmentDomain: "localhost",
	DevelopmentPorts: struct {
		Frontend int
		Backend  int
	}{
		Frontend: 3001,
		Backend:  8080,
	},
	DefaultJWTExpiration: time.Minute * 10,
	// TODO: Implement ExtendJWTExpiration
	// ExtendJWTExpiration:  time.Hour * 24,
}

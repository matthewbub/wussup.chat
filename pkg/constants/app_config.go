package constants

type Config struct {
	ProductionDomain  string
	DevelopmentDomain string
	DevelopmentPorts  struct {
		Frontend int
		Backend  int
	}
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
}

# zcauldron

"z cauldron"

```sh
go run *.go
```

## Initial setup

Shimmy ya way on into the /cmd/dbm directory and run `go run *.go` to hit the TUI. We'll need to run the following chain of commands for development

1. Create development database
2. Seed development database
3. Generate a secure key and add the key to the `../../.env` file as `SESSION_SECRET_KEY = #...`

now you can run the application in development mode from the root dir. (`cd ../../`)

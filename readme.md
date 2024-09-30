# zcauldron

"z cauldron"

During development it's typically easier to run this command:

```sh
templ generate && go run *.go
```

We're using Templ for markup. It's a JSX-like template library that requires an additional build command. As long as the Golang binary is in your environment path, you should have access to templ in this project.

If you're changing a `*.templ` file, you're going to need to run the `templ generate` command to rebuild the templates. Otherwise, you only need to restart the go server. Since were working with HTMX it's pretty common to need to modify both a template and server side code, hence the suggestion to "just run both".

## Initial setup

1. Cd in the repo and run `go mod tidy`
2. Create development database: Run `sqlite3 ./db/dev.db < ./db/schema.sql` from the terminal
3. Duplicate the `.env.example` -> `.env` Generate a secure key and add the key to the .env file as `SESSION_SECRET_KEY = #...`
4. Add your Open AI api key for intelligent parsing as `OPENAI_API_KEY=#...`

## arch

```sh
main.go # <--- entry its right here this is the entry
/routes
  /api
  /views
/src
  /middleware
  /utils
  /models
/public
  /styles
  /javascript
```

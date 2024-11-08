# zcauldron

"z cauldron"

## Set up

Watch this 5 minute getting started video here: https://www.youtube.com/watch?v=BhJ3JFsOh2g

1. Clone repo
2. Duplicate the `.env.example` > `.env`
3. Navigate to the `cmd/generate_base64_key` directory and run `go run main.go` to generate a base64 encoded key.
4. Add the key base64 encoded key to the `SESSION_SECRET_KEY`
5. Navigate back to the root directory and run the SQLite3 schema `sqlite3 ./pkg/database/dev.db < ./pkg/database/schema.sql`
6. (Optional) add your OpenAI Api key to the `.env` file - it will be used again at some point
7. Launch the local server. `go run main.go`
8. _In a separate terminal session_, navigate to the `routes/` directory and install the project dependencies using npm - `npm install`
9. Launch the client dev server `npm run dev`

## (LEGACY) Building and developing

During development it's typically easier to run this command:

```sh
templ generate && ENV=development go run main.go
```

As long as the Golang binary is in your environment path, you should have access to templ in this project. Templ is defined `pkg/views` and served directly from a Go route

If you're changing a `*.templ` file, you're going to need to run the `templ generate` command to rebuild the templates. Otherwise, you only need to restart the go server. Since were working with HTMX it's pretty common to need to modify both a template and server side code, hence the suggestion to "just run both".

However, if you're modifying only say, only `*.go` code, you'd only need to run `go run *.go` to rebuild the go code.

## (LEGACY) Initial setup

1. Cd in the repo and run `go mod tidy`
2. Create development database: Run `sqlite3 ./db/dev.db < ./db/schema.sql` from the terminal
3. Duplicate the `.env.example` -> `.env` Generate a secure key and add the key to the .env file as `SESSION_SECRET_KEY = #...`
4. Add your Open AI api key for intelligent parsing as `OPENAI_API_KEY=#...`

## IDE Configurations

### VSCode / VSCode Forks

[Download the Templ extension.](https://marketplace.visualstudio.com/items?itemName=a-h.templ) - We use Templ as the template language. By default, when you format Templ code it creates a file relative to the `.templ` file. It can easily create an overwhelming workspace. (Golang handles this nicely by default)

[SQLite Explorer](https://marketplace.visualstudio.com/items?itemName=alexcvzz.vscode-sqlite) - Helpful for exploring the database.

### Goland

Configure the database

## Testing

> These tests ran the legacy code and likely will break given modifications to the user table. They will be rewritten..

Currently, the only way we're testing code is via a headless browser. (Can be found in the `test/browser` directory.) The gains in this approach are that we can write tests in a way that feels like pseudo coding through a user journey. It feels much more like a human QA ran through the steps and reported back their findings. I'm jazzed because it feels sooo much less shitty than the respectable mess that is working with React and Jest with JSDom.

## Docker

To run the app on docker

### Build the Docker image

```sh
docker build -t zcauldron .
```

### Run the Docker container

```sh
docker run --env-file .env -p 8080:8080 zcauldron
```

if you're using docker desktop you could open the app.log file to inspect errors. (very handy for troubleshooting deployments)

# zcauldron

"z cauldron"

## Set up locally

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
10. (Optional) In a 3rd terminal session, navigate to the `docs/` directory and install the project dependencies using npm -`npm install`
11. (Optional) Launch the documentation server `npm run start`

## Hosting with Docker (Running the Application Production)

> These steps aren't finalized, there may be info missing atm

This application is designed and built to be hosted from a single Docker image. I find DigitalOcean Droplets to be affordable hosting solutions that work nicely with Docker.

To run the app on docker:

### Build the Docker image

```sh
docker build -t zcauldron .
```

### Run the Docker container

> TODO: This isn't going to use the prod db by default on our local machines, need to work that out

```sh
docker run --env-file .env -p 8080:8080 zcauldron
```

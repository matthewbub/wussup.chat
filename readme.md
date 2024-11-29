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
10. _In a separate terminal session (3 terminals total)_, navigate to the `/lib/image` directory and install the project dependencies. (OR [JUST RUN THE DOCKER IMAGE IF YOU AREN'T DEVELOPING IN THIS SERVER](#build-the-libimage-python-service))

```sh
# Create and activate a virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python main.py
```

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

### Build the `lib/image` Python Service

Prerequisites:

- Ensure Docker daemon is running
- Navigate to the project root directory
- Verify `lib/image/Dockerfile` exists

```sh
# Standard build (recommended)
docker build -t pdf-service -f lib/image/Dockerfile lib/image/

# OR...
# Force a clean build (useful for dependency updates or troubleshooting)
docker build --no-cache -t pdf-service -f lib/image/Dockerfile lib/image/
```

### Run the `lib/image` Python container

The service will listen on port 8082 for PDF upload requests.

Basic usage:

```sh
docker run -p 8082:8082 pdf-service
```

## Project Requirements

If you plan on running the project locally, you're going to need the following installed on your machine. The versions defined are what I am explicitly running right now, if I had to take a guess in the dark I'd say you're good to run with and version greater than or equal to whats defined below.

- [Docker](https://www.docker.com/) version 25.0.2
- [Node.js](https://nodejs.org/en/download/) version 18.0
- [Go](https://go.dev/) version 1.23.1
- [SQLite](https://www.sqlite.org/download.html) version 3.43.2
- [Python](https://www.python.org/downloads/) version 3.12
- Optional [Docker](https://www.docker.com/) version 25.0.2

## About the core stack

This is like a point to chat about for me, these technologies are making for a really fun DX

> NOTICE: I introduced Python because I was unaware the Go ecosystem has perfectly capable libraries that can work with images and PDFs _without_ system level dependencies. Upon this discovery, I plan to replace the Python code with Go. Sorry.

Backend

- [Go](https://go.dev/) - Server side programming language
- [Gin](https://gin-gonic.com/) - HTTP framework
- [SQLite](https://www.sqlite.org/) - Database that's easy to work with

Client

- [React](https://react.dev/) - Web library
- [TanStack Router](https://tanstack.com/router) - Web routing system
- [Vite](https://vite.dev/) - JavaScript build tool
- [TypeScript](https://www.typescriptlang.org/) - Type safe javascript
- [TailwindCSS + TailwindUI](https://tailwindui.com) - Prototype friendly component system

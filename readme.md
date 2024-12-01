# zcauldron

"z cauldron"

## Getting Started

### Project Requirements

If you plan on running the project locally, you're going to need the following installed on your machine. The versions defined are what I am explicitly running right now, if I had to take a guess in the dark I'd say you're good to run with and version greater than or equal to whats defined below.

- [OpenAI API Key](https://openai.com/index/openai-api/)
- [Docker](https://www.docker.com/) version 25.0.2
- [Node.js](https://nodejs.org/en/download/) version 18.0
- [Go](https://go.dev/) version 1.23.1
- [SQLite](https://www.sqlite.org/download.html) version 3.43.2
- [Python](https://www.python.org/downloads/) version 3.12

## Set up locally

Watch this 5 minute getting started video here: https://www.youtube.com/watch?v=BhJ3JFsOh2g

1. **Clone the Repository**
2. **Environment Configuration**
   - Duplicate `.env.example` to `.env`
3. **Generate Base64 Key**
   - Navigate to `cmd/generate_base64_key` and run:
     ```sh
     go run main.go
     ```
   - Add the generated key to `SESSION_SECRET_KEY` in `.env`
4. **Database Setup**
   - Run the SQLite3 schema:
     ```sh
     sqlite3 ./pkg/database/dev.db < ./pkg/database/schema.sql
     ```
5. **Add OpenAI API Key**
   - Update `.env` with your OpenAI API key

### Running the Application

1. **Start the Server**
   - From the root directory, run:
     ```sh
     go run main.go
     ```
2. **Client Setup**
   - In a separate terminal, navigate to `routes/` and install dependencies:
     ```sh
     npm install
     ```
   - Launch the client dev server:
     ```sh
     npm run dev
     ```
3. **Image Service Setup**
   - In another terminal, navigate to `/lib/image` and install dependencies:
     ```sh
     python -m venv venv
     source venv/bin/activate  # On Windows, use: venv\Scripts\activate
     pip install -r requirements.txt
     python main.py
     ```
   - Tip: If you don't need to change code in this server, you might just run the [Docker image](#build-the-libimage-python-service)

## Hosting with Docker

### Run the core application

To run the app on docker:

1. **Build the Image**
   ```sh
   docker build -t zcauldron .
   ```
2. **Run the Container**
   ```sh
   docker run \
      -e ENV=staging \
      -e SESSION_SECRET_KEY=your_secret_key_here \
      -e OPENAI_API_KEY=your_openai_key_here \
      -p 8080:8080 zcauldron
   ```

Next, we need to launch the lib/image micro service

### Build the `lib/image` Python Service

1. **Build the Image**
   ```sh
   docker build -t pdf-service -f lib/image/Dockerfile lib/image/
   ```
2. **Run the Container**
   ```sh
   docker run -p 8082:8082 pdf-service
   ```

## About the core stack

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

Image (Micro Service)

- [Python](https://www.python.org/downloads)
- [PyMuPDF](https://pymupdf.readthedocs.io/en/latest/)

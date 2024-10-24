# Step 1: Build stage
FROM golang:1.23-alpine AS go-builder

# Install build dependencies
RUN apk add --no-cache gcc musl-dev

# Set the working directory inside the container
WORKDIR /app

# Copy go.mod and go.sum files first to leverage Docker's cache
COPY go.mod go.sum ./

# Download all dependencies. Dependencies will be cached if the go.mod and go.sum files are unchanged.
RUN go mod download

# Copy the source code into the container
COPY . .

# Build the Go app with CGO enabled
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o main .
# RUN go build -o main .

# Step 2: Build stage for website
FROM node:20-alpine AS web-builder

# Set working directory
WORKDIR /app/website

# Copy website files
COPY website ./
RUN rm -rf node_modules

# Install dependencies
RUN npm install

# Build the website
RUN npm run build

# Step 3: Run stage
FROM alpine:latest

# Install runtime dependencies
RUN apk add --no-cache sqlite

# Copy your SQL init file
COPY pkg/database/schema.sql /root/pkg/database/schema.sql

# Initialize the database
RUN sqlite3 /root/pkg/database/prod.db < /root/pkg/database/schema.sql

# Set the working directory
WORKDIR /root/

# Copy the binary from the build stage
COPY --from=go-builder /app/main .

# Copy the public assets (e.g., CSS, JS) into the image
COPY --from=go-builder /app/public ./public

# Copy the website build from the build stage
COPY --from=web-builder /app/website/dist ./website/dist

# Expose the port the app runs on
EXPOSE 8080

# Run the executable
CMD ["./main"]
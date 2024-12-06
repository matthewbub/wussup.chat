# Step 1: Build stage for Go
FROM golang:1.23-alpine AS go-builder

# Install build dependencies
RUN apk add --no-cache gcc musl-dev 

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .

# Build the Go app with CGO enabled
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o main .

# Step 2: Build stage for React router
FROM node:20-alpine AS router-builder
WORKDIR /app/routes
COPY routes ./
RUN npm install
RUN npm run build

# Step 3: Run stage
FROM alpine:latest

# Install runtime dependencies
RUN apk add --no-cache sqlite

# Create non-root user
RUN adduser -D appuser

# Set up database directory
WORKDIR /app
RUN mkdir -p /app/data && \
    chown -R appuser:appuser /app/data

# Copy built artifacts
COPY --from=go-builder /app/main .
COPY --from=router-builder /app/routes/dist ./routes/dist
COPY --from=go-builder /app/pkg/database/migrations ./pkg/database/migrations

# Set correct ownership
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

CMD ["./main"]
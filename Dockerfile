# Step 1: Build stage
FROM golang:1.23-alpine AS go-builder
# Install build dependencies
RUN apk add --no-cache gcc musl-dev 
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
# Build the Go app with CGO enabled
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o main .

# Step 2: Build stage for router
FROM node:20-alpine AS router-builder
WORKDIR /app/router
COPY router ./
RUN rm -rf node_modules
RUN npm install
RUN npm run build

# Step 3: Run stage
FROM alpine:latest
RUN apk add --no-cache sqlite
COPY pkg/database/schema.sql /root/pkg/database/schema.sql
RUN sqlite3 /root/pkg/database/prod.db < /root/pkg/database/schema.sql
WORKDIR /root/
COPY --from=go-builder /app/main .
COPY --from=go-builder /app/public ./public
COPY --from=router-builder /app/router/dist ./router/dist
EXPOSE 8080
CMD ["./main"]
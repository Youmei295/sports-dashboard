# Build stage
FROM golang:alpine AS builder

WORKDIR /app

# Copy module files and download dependencies.
# The * on go.sum allows Docker to copy it if it exists, but won't fail if it doesn't (since we have no external dependencies right now).
COPY go.mod go.sum* ./
RUN go mod download

# Copy the source code and build the application
COPY . .
RUN go build -o backend-service main.go

# Run stage (use a minimal alpine image)
FROM alpine:latest

WORKDIR /app
COPY --from=builder /app/backend-service .

# Expose port 8080
EXPOSE 8080

# Command to run the executable
CMD ["./backend-service"]

# Build stage
FROM oven/bun:latest AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies with bun
RUN bun install

# Copy source code
COPY . .

# Build the React app with Vite
RUN bun run build

# Production stage with Nginx
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Copy built app from builder stage
COPY --from=builder /app/dist .

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

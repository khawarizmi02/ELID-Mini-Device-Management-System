# Build stage
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma Client
RUN bunx prisma generate

# Runtime stage
FROM oven/bun:1

WORKDIR /app

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

# Copy source code (both index.ts and src directory)
COPY index.ts .
COPY src ./src
COPY tsconfig.json .

# Expose port
EXPOSE 3000

# Start the application
CMD ["bun", "run", "index.ts"]

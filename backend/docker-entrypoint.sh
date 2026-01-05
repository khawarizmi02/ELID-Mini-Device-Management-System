#!/bin/bash
set -e

echo "Waiting for database to be ready..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
  if bun run -e "
    const pg = require('pg');
    const client = new pg.Client({
      host: '${DB_HOST:-postgres}',
      user: 'postgres',
      password: 'password',
      database: 'postgres'
    });
    client.connect()
      .then(() => { client.end(); process.exit(0); })
      .catch(() => process.exit(1));
  " 2>/dev/null; then
    echo "Database is ready!"
    break
  fi
  echo "Database is unavailable - sleeping (attempt $attempt/$max_attempts)"
  sleep 1
  attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
  echo "Failed to connect to database after $max_attempts attempts"
  exit 1
fi

echo "Running Prisma migrations..."
bunx prisma migrate deploy

echo "Generating Prisma Client..."
bunx prisma generate

echo "Starting application..."
exec bun run index.ts

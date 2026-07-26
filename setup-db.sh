#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting Kylin Esports Hub Database Setup..."

# 1. Set PostgreSQL password environment variable so psql doesn't prompt for it
export PGPASSWORD="password"

# 2. Check if PostgreSQL is accessible on loopback IP
echo "🔄 Checking PostgreSQL connection..."
if ! psql -U postgres -h 127.0.0.1 -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Error: Cannot connect to PostgreSQL."
    echo "Please ensure PostgreSQL is installed, running, and the password is 'password'."
    exit 1
fi

# 3. Create the database if it doesn't exist
echo "🗄️ Checking for 'esports_hub' database..."
DB_EXISTS=$(psql -U postgres -h 127.0.0.1 -tAc "SELECT 1 FROM pg_database WHERE datname='esports_hub'")

if [ "$DB_EXISTS" = "1" ]; then
    echo "✅ Database 'esports_hub' already exists."
else
    echo "➕ Creating database 'esports_hub'..."
    psql -U postgres -h 127.0.0.1 -c "CREATE DATABASE esports_hub;"
    echo "✅ Database created successfully."
fi

# 4. Run Prisma commands with inline connection string to bypass environment isolation
echo "📦 Running Prisma schema sync..."

DATABASE_URL="postgresql://postgres:password@127.0.0.1:5432/esports_hub?schema=public" npx prisma generate

DATABASE_URL="postgresql://postgres:password@127.0.0.1:5432/esports_hub?schema=public" npx prisma db push

echo "🌱 Seeding default admin and user accounts..."
DATABASE_URL="postgresql://postgres:password@127.0.0.1:5432/esports_hub?schema=public" npx prisma db seed

echo "🎉 Database setup complete! You are ready to run 'npm run dev'."

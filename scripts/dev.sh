#!/bin/bash

# Development server startup script
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# ANSI color codes
BACKEND_COLOR="\033[1;34m"  # Blue
FRONTEND_COLOR="\033[1;32m" # Green
RESET_COLOR="\033[0m"

echo "Starting development servers..."

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "Shutting down development servers..."
    kill $(jobs -p) 2>/dev/null || true
    exit
}

trap cleanup SIGINT SIGTERM EXIT

# Function to prefix output with colored labels
prefix_output() {
    local prefix="$1"
    local color="$2"
    while IFS= read -r line; do
        echo -e "${color}[${prefix}]${RESET_COLOR} $line"
    done
}

# Start backend server
echo "Starting backend server..."
cd "$BACKEND_DIR"

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

if [ ! -d "node_modules/.prisma" ] && [ -d "prisma" ]; then
    echo "Generating Prisma client..."
    npx prisma generate
fi

npm run dev 2>&1 | prefix_output "BACKEND" "$BACKEND_COLOR" &
BACKEND_PID=$!

# Start frontend server
echo "Starting frontend server..."
cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

npm start 2>&1 | prefix_output "FRONTEND" "$FRONTEND_COLOR" &
FRONTEND_PID=$!

echo ""
echo "Development servers started!"
echo -e "${BACKEND_COLOR}Backend${RESET_COLOR} running on port 4000"
echo -e "${FRONTEND_COLOR}Frontend${RESET_COLOR} running on port 3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait

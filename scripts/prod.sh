#!/bin/bash

# Production deployment script
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BUILD_DIR="$PROJECT_ROOT/build"
LOG_DIR="$PROJECT_ROOT/logs"
LOG_FILE="$LOG_DIR/production-$(date +%Y%m%d-%H%M%S).log"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

echo "Starting production deployment..."
echo "Logs will be written to: $LOG_FILE"

# Clean up previous build
if [ -d "$BUILD_DIR" ]; then
    echo "Cleaning previous build..."
    rm -rf "$BUILD_DIR"
fi

mkdir -p "$BUILD_DIR"

# Build frontend
echo "Building frontend..."
cd "$FRONTEND_DIR"

echo "Installing frontend dependencies..."
npm ci

echo "Running frontend build..."
npm run build

# Copy frontend build to build directory
echo "Copying frontend build artifacts..."
cp -r dist "$BUILD_DIR/"

# Prepare backend
echo "Preparing backend..."
cd "$BACKEND_DIR"

echo "Installing backend dependencies..."
npm ci

echo "Building backend..."
npm run build

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Copy backend files to build directory
echo "Copying backend files..."
cp -r "$BACKEND_DIR"/* "$BUILD_DIR/"
cp "$BACKEND_DIR"/package*.json "$BUILD_DIR/"
cp "$BACKEND_DIR"/tsconfig.json "$BUILD_DIR/"

if [ -d "$BACKEND_DIR/certificate" ]; then
    cp -r "$BACKEND_DIR/certificate" "$BUILD_DIR/"
fi

if [ -d "$BACKEND_DIR/prisma" ]; then
    cp -r "$BACKEND_DIR/prisma" "$BUILD_DIR/"
fi

echo ""
echo "Production build completed successfully!"
echo "Build artifacts are in: $BUILD_DIR"
echo ""
echo "To start the production server, run:"
echo "  sudo systemctl start mjc-website"
echo ""
echo "Or to start manually:"
echo "  ./scripts/start.sh"

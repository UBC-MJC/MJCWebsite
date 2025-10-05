#!/bin/bash

# Production start script (for systemd)
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_DIR="$PROJECT_ROOT/build"
LOG_DIR="$PROJECT_ROOT/logs"
BACKEND_LOG="$LOG_DIR/backend-$(date +%Y%m%d).log"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    echo "Error: Build directory not found. Please run prod.sh first to build the application."
    exit 1
fi

# Start the server with logging
cd "$BUILD_DIR"
exec node ./dist/js/app.js >> "$BACKEND_LOG" 2>&1

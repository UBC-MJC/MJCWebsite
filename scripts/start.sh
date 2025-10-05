#!/bin/bash

# Production start script (for systemd)
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_DIR="$PROJECT_ROOT/build"

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    echo "Error: Build directory not found. Please run prod.sh first to build the application."
    exit 1
fi

# Start the server
cd "$BUILD_DIR"
exec node ./dist/app.js

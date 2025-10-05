#!/bin/bash

# Local build and remote deployment script
set -e

# Configuration - UPDATE THESE VALUES
SERVER_USER="ubuntu"
SERVER_HOST="ec2-54-185-167-168.us-west-2.compute.amazonaws.com"
SERVER_PATH="/home/ubuntu/MJCWebsite"
KEY_PATH="/home/iforgot/MahjongKeyPair_v2.pem"  # Path to your SSH private key

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Project paths
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_DIR="$PROJECT_ROOT/build"

echo -e "${GREEN}Starting local build and deployment...${NC}"
echo ""

# Check if server configuration is set
if [ "$SERVER_USER" = "YOUR_USERNAME" ] || [ "$SERVER_HOST" = "YOUR_SERVER_IP_OR_DOMAIN" ]; then
    echo -e "${RED}Error: Please configure SERVER_USER, SERVER_HOST, and SERVER_PATH in this script first.${NC}"
    exit 1
fi

# Step 1: Build locally
echo -e "${YELLOW}Step 1: Building application locally...${NC}"
cd "$PROJECT_ROOT"
./scripts/prod.sh

if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}Error: Build failed. Build directory not found.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}Build completed successfully!${NC}"
echo ""

# Step 2: Stop remote service
echo -e "${YELLOW}Step 2: Stopping remote service...${NC}"
ssh -i "${KEY_PATH}" "${SERVER_USER}@${SERVER_HOST}" "sudo systemctl stop mjc-website" || {
    echo -e "${YELLOW}Warning: Failed to stop service (may not be running)${NC}"
}

echo ""

# Step 3: Deploy build artifacts
echo -e "${YELLOW}Step 3: Deploying build artifacts to server...${NC}"
echo "Syncing to: ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/build/"
rsync -avz -e "ssh -i ${KEY_PATH}" --delete \
    --exclude='.git' \
    "$BUILD_DIR/" \
    "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/build/"

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: rsync failed. Deployment aborted.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}Deployment completed!${NC}"
echo ""

# Step 4: Deploy .env.production if it exists
if [ -f "$PROJECT_ROOT/.env.production" ]; then
    echo -e "${YELLOW}Step 4: Deploying .env.production...${NC}"
    rsync -avz -e "ssh -i ${KEY_PATH}" "$PROJECT_ROOT/.env.production" \
        "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/.env.production"
    echo ""
fi
echo ""

# Step 6: Start remote service
echo -e "${YELLOW}Step 6: Starting remote service...${NC}"
ssh -i "${KEY_PATH}" "${SERVER_USER}@${SERVER_HOST}" "sudo systemctl start mjc-website"

echo ""

# Step 7: Check service status
echo -e "${YELLOW}Step 7: Checking service status...${NC}"
ssh -i "${KEY_PATH}" "${SERVER_USER}@${SERVER_HOST}" "sudo systemctl status mjc-website --no-pager -l" || true

echo ""
echo -e "${GREEN}Deployment complete!${NC}"
echo ""
echo "View logs on server:"
echo "  ssh ${SERVER_USER}@${SERVER_HOST} 'tail -f ${SERVER_PATH}/logs/backend-*.log'"
echo ""
echo "Check service status:"
echo "  ssh ${SERVER_USER}@${SERVER_HOST} 'sudo systemctl status mjc-website'"

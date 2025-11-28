#!/bin/bash
# Deploy script for gm-tc.tech on Uberspace
# Place this in ~/bin/deploy-gm-tc.sh on your Uberspace server

set -e  # Exit on any error

# Configuration - UPDATE THESE VALUES
REPO_DIR="$HOME/repos/gm-tc"
BRANCH="main"
WEB_ROOT="$HOME/html"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Deploying gm-tc.tech ===${NC}"
echo "$(date)"
echo ""

# Check if repo exists
if [ ! -d "$REPO_DIR" ]; then
    echo -e "${RED}Error: Repository not found at $REPO_DIR${NC}"
    echo "Run: git clone <repo-url> $REPO_DIR"
    exit 1
fi

cd "$REPO_DIR"

# Fetch latest changes
echo -e "${YELLOW}Fetching latest changes...${NC}"
git fetch origin

# Check if there are updates
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/$BRANCH)

if [ "$LOCAL" = "$REMOTE" ]; then
    echo -e "${GREEN}Already up to date.${NC}"
    exit 0
fi

# Pull changes
echo -e "${YELLOW}Pulling $BRANCH...${NC}"
git checkout $BRANCH
git pull origin $BRANCH

# Show what changed
echo ""
echo -e "${YELLOW}Changes deployed:${NC}"
git log --oneline $LOCAL..$REMOTE

# If you have npm dependencies, uncomment:
# echo -e "${YELLOW}Installing npm dependencies...${NC}"
# npm install --production

# If you have composer dependencies, uncomment:
# echo -e "${YELLOW}Installing composer dependencies...${NC}"
# composer install --no-dev --optimize-autoloader

# Clear any caches if needed
# echo -e "${YELLOW}Clearing caches...${NC}"
# rm -rf cache/*

echo ""
echo -e "${GREEN}=== Deployment complete! ===${NC}"
echo "Deployed: $(git rev-parse --short HEAD)"
echo "$(date)"

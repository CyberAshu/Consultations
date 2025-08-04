#!/bin/bash

# Production Deployment Script
# Run this on your production server

echo "🚀 Starting Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "app/main.py" ]; then
    echo -e "${RED}❌ Error: Not in backend directory. Please run from backend folder.${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Step 1: Pulling latest code...${NC}"
git pull origin main || echo -e "${YELLOW}⚠️  Git pull failed or not a git repo${NC}"

echo -e "${YELLOW}🔧 Step 2: Installing dependencies...${NC}"
source venv/bin/activate
pip install -r requirements.txt

echo -e "${YELLOW}🏗️  Step 3: Checking configuration...${NC}"
python -c "from app.core.config import settings; print(f'✅ Config loaded: {settings.PROJECT_NAME}')"

echo -e "${YELLOW}🔄 Step 4: Restarting services...${NC}"
sudo systemctl restart gunicorn.service
sudo systemctl status gunicorn.service --no-pager

echo -e "${YELLOW}🧪 Step 5: Testing endpoints...${NC}"
sleep 3

# Test health check
echo "Testing basic API..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/v1/features/services || echo "API test failed"

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Check logs: sudo journalctl -u gunicorn.service -f"
echo "2. Test endpoints manually"
echo "3. Monitor for errors"

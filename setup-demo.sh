#!/bin/bash

#
# THECOLLAB IFY DEMO SETUP SCRIPT
# 
# One-command setup for the complete demo platform
# No OTP required - works out of the box!
#

set -e

echo "🚀 TheCollabify Demo Platform Setup"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo -e "${BLUE}ℹ️  Node version:${NC}"
node --version
echo ""

# Check if we're in the right directory
if [ ! -f "backend/app.js" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Install backend dependencies
echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
cd backend
npm install --silent > /dev/null 2>&1 || npm install
cd ..
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Setup database (optional - with confirmation)
echo -e "${YELLOW}⚠️  Note: Ensure your DATABASE_URL is set in .env${NC}"
echo ""

# Generate Prisma client
echo -e "${BLUE}🔧 Generating Prisma client...${NC}"
cd backend
npx prisma generate --silent > /dev/null 2>&1 || npx prisma generate
cd ..
echo -e "${GREEN}✅ Prisma client generated${NC}"
echo ""

# Show environment check
echo -e "${BLUE}🔍 Checking environment...${NC}"
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✅ .env file found${NC}"
    if grep -q "DATABASE_URL" backend/.env; then
        echo -e "${GREEN}✅ DATABASE_URL configured${NC}"
    else
        echo -e "${YELLOW}⚠️  DATABASE_URL not found in .env${NC}"
    fi
    if grep -q "JWT_SECRET" backend/.env; then
        echo -e "${GREEN}✅ JWT_SECRET configured${NC}"
    else
        echo -e "${YELLOW}⚠️  JWT_SECRET not found in .env${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo "   Create backend/.env with DATABASE_URL and JWT_SECRET"
fi
echo ""

# Show quick start instructions
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ SETUP COMPLETE!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${BLUE}📝 QUICK START:${NC}"
echo ""
echo "1. Start the backend server:"
echo -e "   ${YELLOW}cd backend && npm run dev${NC}"
echo ""
echo "2. In another terminal, create demo users:"
echo -e "   ${YELLOW}curl -X POST http://localhost:8080/api/demo/create-demo-users${NC}"
echo ""
echo "3. Use the returned tokens to test the API:"
echo -e "   ${YELLOW}curl -H 'Authorization: Bearer YOUR_TOKEN' \\${NC}"
echo -e "   ${YELLOW}  http://localhost:8080/api/sellers/profile${NC}"
echo ""

echo -e "${BLUE}📚 DOCUMENTATION:${NC}"
echo "   Read DEMO_PLATFORM_GUIDE.md for complete workflows"
echo ""

echo -e "${BLUE}🧪 RUN TESTS:${NC}"
echo -e "   ${YELLOW}cd backend && npm test -- test-demo-workflow.test.js${NC}"
echo ""

echo -e "${BLUE}🧹 CLEAN UP DEMO DATA:${NC}"
echo -e "   ${YELLOW}curl -X POST http://localhost:8080/api/demo/clean-demo-data${NC}"
echo ""

echo -e "${BLUE}📋 KEY ENDPOINTS:${NC}"
echo "   POST   /api/auth/register                    - Register (seller or creator)"
echo "   POST   /api/demo/create-demo-users           - Create complete demo"
echo "   GET    /api/chat/conversations               - List conversations"
echo "   POST   /api/chat/[ID]/message                - Send message"
echo "   GET    /api/sellers/campaigns                - List seller campaigns"
echo "   GET    /api/creators/campaigns               - Browse creator campaigns"
echo ""

echo -e "${GREEN}Happy testing! 🎉${NC}"
echo ""

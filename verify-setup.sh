#!/bin/bash

################################################################################
# SpecToPR Setup Verification Script
# 
# This script verifies that the SpecToPR system is properly configured and
# ready to run. It checks:
# - Node.js and npm versions
# - Backend dependencies
# - Frontend dependencies
# - Environment variables
# - Backend API health
# - Frontend build capability
#
# Usage: ./verify-setup.sh
################################################################################

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters for summary
PASSED=0
FAILED=0
WARNINGS=0

# Print colored output
print_success() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
}

print_error() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo ""
}

# Function to compare version numbers
version_compare() {
    if [[ $1 == $2 ]]; then
        return 0
    fi
    local IFS=.
    local i ver1=($1) ver2=($2)
    for ((i=${#ver1[@]}; i<${#ver2[@]}; i++)); do
        ver1[i]=0
    done
    for ((i=0; i<${#ver1[@]}; i++)); do
        if [[ -z ${ver2[i]} ]]; then
            ver2[i]=0
        fi
        if ((10#${ver1[i]} > 10#${ver2[i]})); then
            return 1
        fi
        if ((10#${ver1[i]} < 10#${ver2[i]})); then
            return 2
        fi
    done
    return 0
}

################################################################################
# Check Prerequisites
################################################################################

print_header "Checking Prerequisites"

# Check Node.js
print_info "Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | sed 's/v//')
    version_compare $NODE_VERSION "14.0.0"
    result=$?
    if [[ $result -eq 2 ]]; then
        print_error "Node.js version $NODE_VERSION is too old (minimum: 14.0.0)"
        print_info "Please upgrade Node.js: https://nodejs.org/"
    else
        print_success "Node.js version $NODE_VERSION installed"
    fi
else
    print_error "Node.js is not installed"
    print_info "Install Node.js from: https://nodejs.org/"
fi

# Check npm
print_info "Checking npm installation..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm version $NPM_VERSION installed"
else
    print_error "npm is not installed"
    print_info "npm should come with Node.js installation"
fi

# Check Git
print_info "Checking Git installation..."
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version | awk '{print $3}')
    print_success "Git version $GIT_VERSION installed"
else
    print_warning "Git is not installed (optional but recommended)"
    print_info "Install Git from: https://git-scm.com/"
fi

################################################################################
# Check Backend Setup
################################################################################

print_header "Checking Backend Setup"

# Check if backend directory exists
if [ ! -d "backend" ]; then
    print_error "Backend directory not found"
    print_info "Make sure you're running this script from the project root"
    exit 1
fi

# Check backend package.json
print_info "Checking backend package.json..."
if [ -f "backend/package.json" ]; then
    print_success "Backend package.json found"
else
    print_error "Backend package.json not found"
fi

# Check backend dependencies
print_info "Checking backend dependencies..."
if [ -d "backend/node_modules" ]; then
    print_success "Backend dependencies installed"
else
    print_error "Backend dependencies not installed"
    print_info "Run: cd backend && npm install"
fi

# Check backend .env file
print_info "Checking backend environment configuration..."
if [ -f "backend/.env" ]; then
    print_success "Backend .env file found"
    
    # Check required environment variables
    source backend/.env 2>/dev/null
    
    if [ -z "$BOB_API_KEY" ]; then
        print_warning "BOB_API_KEY not set in .env"
        print_info "Set your IBM Bob API key in backend/.env"
    else
        print_success "BOB_API_KEY is configured"
    fi
    
    if [ -z "$GITHUB_TOKEN" ]; then
        print_warning "GITHUB_TOKEN not set in .env"
        print_info "Set your GitHub token in backend/.env"
    else
        print_success "GITHUB_TOKEN is configured"
    fi
    
    if [ -z "$PORT" ]; then
        print_info "PORT not set, will use default (3001)"
    else
        print_success "PORT is set to $PORT"
    fi
else
    print_error "Backend .env file not found"
    print_info "Copy backend/.env.example to backend/.env and configure it"
fi

# Check backend server file
print_info "Checking backend server file..."
if [ -f "backend/server.js" ]; then
    print_success "Backend server.js found"
else
    print_error "Backend server.js not found"
fi

################################################################################
# Check Frontend Setup
################################################################################

print_header "Checking Frontend Setup"

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
    print_error "Frontend directory not found"
    exit 1
fi

# Check frontend package.json
print_info "Checking frontend package.json..."
if [ -f "frontend/package.json" ]; then
    print_success "Frontend package.json found"
else
    print_error "Frontend package.json not found"
fi

# Check frontend dependencies
print_info "Checking frontend dependencies..."
if [ -d "frontend/node_modules" ]; then
    print_success "Frontend dependencies installed"
else
    print_error "Frontend dependencies not installed"
    print_info "Run: cd frontend && npm install"
fi

# Check frontend .env file
print_info "Checking frontend environment configuration..."
if [ -f "frontend/.env" ]; then
    print_success "Frontend .env file found"
    
    source frontend/.env 2>/dev/null
    
    if [ -z "$REACT_APP_API_URL" ]; then
        print_warning "REACT_APP_API_URL not set in .env"
        print_info "Set the backend API URL in frontend/.env"
    else
        print_success "REACT_APP_API_URL is set to $REACT_APP_API_URL"
    fi
else
    print_error "Frontend .env file not found"
    print_info "Copy frontend/.env.example to frontend/.env and configure it"
fi

# Check frontend source files
print_info "Checking frontend source files..."
if [ -f "frontend/src/App.js" ]; then
    print_success "Frontend App.js found"
else
    print_error "Frontend App.js not found"
fi

################################################################################
# Test Backend API
################################################################################

print_header "Testing Backend API"

print_info "Checking if backend is running..."

# Try to connect to backend health endpoint
BACKEND_PORT=${PORT:-3001}
BACKEND_URL="http://localhost:$BACKEND_PORT"

if curl -s -f "$BACKEND_URL/api/health" > /dev/null 2>&1; then
    print_success "Backend API is running and responding"
    
    # Get health check response
    HEALTH_RESPONSE=$(curl -s "$BACKEND_URL/api/health")
    print_info "Health check response: $HEALTH_RESPONSE"
else
    print_warning "Backend API is not running"
    print_info "Start the backend with: cd backend && npm start"
    print_info "Or run in development mode: cd backend && npm run dev"
fi

################################################################################
# Test Frontend Build
################################################################################

print_header "Testing Frontend Build"

print_info "Checking if frontend can build..."

if [ -d "frontend/node_modules" ]; then
    # Try to build frontend (this might take a while)
    print_info "Attempting to build frontend (this may take a moment)..."
    
    cd frontend
    if npm run build > /tmp/frontend-build.log 2>&1; then
        print_success "Frontend builds successfully"
        
        if [ -d "build" ]; then
            BUILD_SIZE=$(du -sh build | cut -f1)
            print_info "Build size: $BUILD_SIZE"
        fi
    else
        print_error "Frontend build failed"
        print_info "Check build log: /tmp/frontend-build.log"
        print_info "Common issues:"
        print_info "  - Missing dependencies: npm install"
        print_info "  - Syntax errors in source files"
        print_info "  - Environment variables not set"
    fi
    cd ..
else
    print_warning "Skipping frontend build test (dependencies not installed)"
fi

################################################################################
# Check Documentation
################################################################################

print_header "Checking Documentation"

DOCS=("README.md" "SETUP.md" "ARCHITECTURE.md" "TESTING.md" "DEVELOPMENT.md" "DEPLOYMENT.md")

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        print_success "$doc found"
    else
        print_warning "$doc not found"
    fi
done

################################################################################
# Print Summary
################################################################################

print_header "Verification Summary"

echo ""
echo -e "${GREEN}Passed:${NC}   $PASSED"
echo -e "${RED}Failed:${NC}   $FAILED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo ""

if [ $FAILED -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}  ✓ All checks passed! System is ready to use.${NC}"
        echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
        echo ""
        echo "Next steps:"
        echo "  1. Start backend:  cd backend && npm start"
        echo "  2. Start frontend: cd frontend && npm start"
        echo "  3. Open browser:   http://localhost:3000"
        echo ""
        exit 0
    else
        echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
        echo -e "${YELLOW}  ⚠ System is ready but has warnings.${NC}"
        echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
        echo ""
        echo "Review the warnings above and fix them if needed."
        echo ""
        exit 0
    fi
else
    echo -e "${RED}═══════════════════════════════════════════════════════${NC}"
    echo -e "${RED}  ✗ Setup verification failed!${NC}"
    echo -e "${RED}═══════════════════════════════════════════════════════${NC}"
    echo ""
    echo "Please fix the errors above before proceeding."
    echo ""
    echo "Common fixes:"
    echo "  - Install Node.js: https://nodejs.org/"
    echo "  - Install backend dependencies: cd backend && npm install"
    echo "  - Install frontend dependencies: cd frontend && npm install"
    echo "  - Configure environment: cp backend/.env.example backend/.env"
    echo "  - Configure environment: cp frontend/.env.example frontend/.env"
    echo ""
    echo "For detailed setup instructions, see SETUP.md"
    echo ""
    exit 1
fi

# Made with Bob

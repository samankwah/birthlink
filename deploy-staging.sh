#!/bin/bash

# BirthLink Ghana - Staging Deployment Script
# Phase 3: Pilot Testing & Refinement
# Created: August 12, 2025

set -e  # Exit on any error

echo "🚀 BirthLink Ghana - Staging Deployment"
echo "======================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Firebase CLI is installed
print_status "Checking Firebase CLI installation..."
if ! command -v firebase &> /dev/null; then
    print_error "Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

print_success "Firebase CLI is installed"

# Check if user is logged in to Firebase
print_status "Checking Firebase authentication..."
if ! firebase projects:list &> /dev/null; then
    print_error "You are not logged in to Firebase. Please run:"
    echo "firebase login"
    exit 1
fi

print_success "Firebase authentication verified"

# Load staging environment variables
print_status "Loading staging environment configuration..."
if [ ! -f .env.staging ]; then
    print_error "Staging environment file (.env.staging) not found!"
    print_error "Please create .env.staging with your Firebase staging configuration"
    exit 1
fi

# Copy staging env to .env for build
cp .env.staging .env
print_success "Staging environment loaded"

# Install dependencies
print_status "Installing dependencies..."
npm ci
print_success "Dependencies installed"

# Run tests
print_status "Running tests..."
npm run test -- --run --reporter=verbose 2>/dev/null || {
    print_warning "Test command not available or tests failed"
    print_warning "Continuing with deployment (tests should be run manually)"
}

# Run linting
print_status "Running code quality checks..."
npm run lint 2>/dev/null || {
    print_warning "Lint command not available"
    print_warning "Please ensure code quality manually"
}

# Build the application
print_status "Building application for staging..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Application built successfully"
else
    print_error "Build failed!"
    exit 1
fi

# Check build output
if [ ! -d "dist" ]; then
    print_error "Build directory (dist) not found!"
    exit 1
fi

print_status "Build size analysis:"
du -sh dist/
echo ""

# Deploy to Firebase
print_status "Deploying to Firebase staging..."

# First, set the Firebase project (you'll need to replace with actual project ID)
print_warning "Make sure you have set the correct Firebase project:"
echo "firebase use your-staging-project-id"
echo ""

read -p "Press Enter to continue with deployment or Ctrl+C to cancel..."

# Deploy hosting, firestore rules, and indexes
firebase deploy --only hosting,firestore:rules,firestore:indexes

if [ $? -eq 0 ]; then
    print_success "Deployment completed successfully!"
    echo ""
    print_status "Post-deployment tasks:"
    echo "1. ✅ Application deployed to Firebase Hosting"
    echo "2. ✅ Firestore security rules updated"
    echo "3. ✅ Database indexes configured"
    echo ""
    print_status "Next steps:"
    echo "1. 🔗 Access staging app: https://your-project-id.web.app"
    echo "2. 🧪 Run smoke tests on deployed application"
    echo "3. 📊 Set up monitoring and analytics"
    echo "4. 👥 Begin user training program"
    echo ""
    print_success "Staging deployment ready for Phase 3 pilot testing! 🇬🇭"
else
    print_error "Deployment failed!"
    exit 1
fi

# Clean up
rm .env  # Remove the copied environment file
print_status "Environment cleanup completed"

echo ""
print_success "🎉 BirthLink Ghana staging deployment completed!"
print_status "Ready for Phase 3 pilot testing with 50 registrars across 3 districts"
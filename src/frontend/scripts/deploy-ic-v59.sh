#!/bin/bash
# Version 59 Production Deployment Helper Script
# 
# This script deploys the Maui Lane Care Home application to the Internet Computer
# production network and provides reminders for required verification steps.
#
# Prerequisites:
# - dfx CLI installed and configured
# - Wallet configured with sufficient cycles
# - Frontend build completed successfully
#
# Usage:
#   ./frontend/scripts/deploy-ic-v59.sh

set -e

echo "=========================================="
echo "Version 59 Production Deployment"
echo "=========================================="
echo ""

# Check if dfx is installed
if ! command -v dfx &> /dev/null; then
    echo "❌ Error: dfx CLI not found. Please install dfx first."
    exit 1
fi

echo "✅ dfx CLI found"
echo ""

# Verify version markers before deployment
echo "📋 Pre-deployment checks:"
echo ""

VERSION_TXT=$(cat frontend/public/version.txt | tr -d '[:space:]')
if [ "$VERSION_TXT" = "59" ]; then
    echo "✅ version.txt contains '59'"
else
    echo "❌ Error: version.txt contains '$VERSION_TXT' (expected '59')"
    exit 1
fi

if grep -q 'content="59"' frontend/index.html; then
    echo "✅ index.html contains app-version meta tag with '59'"
else
    echo "❌ Error: index.html does not contain correct version meta tag"
    exit 1
fi

echo ""
echo "🚀 Starting deployment to Internet Computer..."
echo ""

# Deploy to production
dfx deploy --network ic

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "📋 Required Verification Steps:"
echo ""
echo "1. Version Marker Check:"
echo "   - Visit your production URL and check /version.txt returns '59'"
echo "   - Inspect page source and verify <meta name=\"app-version\" content=\"59\" />"
echo ""
echo "2. Basic Smoke Test:"
echo "   - ✓ Internet Identity login works"
echo "   - ✓ Dashboard loads without errors"
echo "   - ✓ Resident Profile page can be opened"
echo "   - ✓ No new console errors"
echo ""
echo "3. Full Smoke Test (see frontend/docs/deploy-v59.md):"
echo "   - Authentication & Authorization"
echo "   - Residents Dashboard"
echo "   - Resident Profile"
echo "   - Vitals Management"
echo "   - MAR (Medication Administration Record)"
echo "   - ADL (Activities of Daily Living)"
echo "   - Medications Management"
echo "   - Resident CRUD Operations"
echo ""
echo "For detailed verification steps, see:"
echo "  frontend/docs/deploy-v59.md"
echo ""

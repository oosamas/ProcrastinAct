#!/bin/bash
# Prepare monorepo packages for EAS build
# This script packs workspace packages so they can be uploaded with the mobile app

set -e

MOBILE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ROOT_DIR="$(cd "$MOBILE_DIR/../.." && pwd)"
VENDOR_DIR="$MOBILE_DIR/vendor"

echo "📦 Preparing workspace packages for EAS build..."

# Create vendor directory
rm -rf "$VENDOR_DIR"
mkdir -p "$VENDOR_DIR"

# Pack each workspace package
for pkg in types core ui; do
  PKG_DIR="$ROOT_DIR/packages/$pkg"
  if [ -d "$PKG_DIR" ]; then
    echo "  Packing @procrastinact/$pkg..."
    cd "$PKG_DIR"
    npm pack --pack-destination "$VENDOR_DIR" 2>/dev/null
  fi
done

# List created tarballs
echo ""
echo "✅ Created tarballs:"
ls -la "$VENDOR_DIR"

echo ""
echo "📝 Now update package.json dependencies to use file: references"
echo "   Then run: cd apps/mobile && npx eas-cli build --platform ios --profile production"

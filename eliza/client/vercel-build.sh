#!/bin/bash
# Vercel build script that bypasses workspace dependency issues

set -e
echo "Starting Vercel build script..."

# Copy the Vercel-specific package.json
echo "Copying simplified package.json..."
cp package.vercel.json package.json

# Clean install without using lockfile
echo "Installing dependencies..."
pnpm install --no-frozen-lockfile

# Build the client
echo "Building client..."
pnpm build

echo "Build completed successfully!" 
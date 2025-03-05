#!/bin/bash
# Vercel build script that bypasses workspace dependency issues

set -e
echo "Starting Vercel build script..."

# Copy the Vercel-specific package.json
echo "Copying simplified package.json..."
cp package.vercel.json package.json

# Clean install using npm instead of pnpm
echo "Installing dependencies using npm..."
npm install

# Build the client
echo "Building client..."
npm run build

echo "Build completed successfully!" 
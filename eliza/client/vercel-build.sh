#!/bin/bash
# Vercel build script that bypasses workspace dependency issues

set -e
echo "Starting Vercel build script..."

# Copy the Vercel-specific package.json
echo "Copying simplified package.json..."
cp package.vercel.json package.json

# Create a .npmrc file with settings to avoid Docusaurus issues
echo "Configuring npm..."
cat > .npmrc << EOL
legacy-peer-deps=true
fund=false
audit=false
loglevel=error
fetch-retries=5
fetch-retry-factor=2
fetch-retry-mintimeout=20000
fetch-retry-maxtimeout=120000
EOL

# Clean install using npm instead of pnpm
echo "Installing dependencies using npm..."
npm install --no-package-lock

# Build the client
echo "Building client..."
npm run build

echo "Build completed successfully!" 
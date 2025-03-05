#!/bin/bash
# Vercel build script that bypasses workspace dependency issues

# Copy the Vercel-specific package.json
cp package.vercel.json package.json

# Install dependencies
pnpm install --no-frozen-lockfile

# Build the client
pnpm build 
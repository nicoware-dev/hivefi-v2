# HiveFi Client

A multichain DeFi dashboard built with React, Vite, and Privy for wallet authentication.

## Features

- Wallet authentication with Privy
- Portfolio tracking across multiple chains
- Integration with Zerion API for real-time portfolio data
- Responsive design for desktop and mobile

## Development

### Prerequisites

- Node.js 16+
- pnpm

### Installation

```bash
# Install dependencies
pnpm install
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Privy Configuration
VITE_PRIVY_APP_ID=your_privy_app_id

# Chain Configuration
VITE_CHAIN_ID=146
VITE_CHAIN_NAME=Sonic
VITE_CHAIN_RPC_URL=https://rpc.soniclabs.com
VITE_CHAIN_EXPLORER_URL=https://sonicscan.org/

# Zerion API Configuration
VITE_ZERION_API_KEY=your_zerion_api_key

# Development Options
# Set to 'true' to use mock data instead of making API calls
VITE_USE_MOCK_DATA=true
```

### Running the Development Server

```bash
# Start the frontend development server with mock data
pnpm dev
```

## Deployment to Vercel

This project is configured for easy deployment to Vercel.

### Setup

1. Create a Vercel account if you don't have one
2. Install the Vercel CLI: `npm i -g vercel`
3. Login to Vercel: `vercel login`

### Environment Variables

Add the following environment variables in the Vercel dashboard:

- `ZERION_API_KEY`: Your Zerion API key

### Deploy

```bash
# Deploy to Vercel
vercel

# Or deploy to production
vercel --prod
```

### Important Notes

- The project uses Vercel Serverless Functions to proxy requests to the Zerion API
- In development, it uses mock data by default (controlled by `VITE_USE_MOCK_DATA`)
- In production, it uses the Vercel API routes to fetch real data

## How It Works

### Development Mode

In development mode, the application can work in two ways:

1. **Mock Data Mode** (default): Set `VITE_USE_MOCK_DATA=true` in your `.env` file to use mock data without making any API calls.

2. **Real Data Mode**: Set `VITE_USE_MOCK_DATA=false` in your `.env` file to use the Vercel API routes to fetch real data.

### Production Mode

In production mode, the application always uses the Vercel API routes to fetch real data from the Zerion API. The API key is stored securely as an environment variable in Vercel.

## License

MIT


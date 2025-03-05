const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for the frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST'],
  credentials: true
}));

// Parse JSON request body
app.use(express.json());

// Zerion API base URL
const ZERION_V1_BASE_URL = 'https://api.zerion.io/v1';
const ZERION_API_KEY = process.env.VITE_ZERION_API_KEY;

if (!ZERION_API_KEY) {
  console.error('ZERION_API_KEY not found in environment variables');
  process.exit(1);
}

// Encode API key for Basic Auth
const encodedApiKey = Buffer.from(`${ZERION_API_KEY}:`).toString('base64');

// Proxy endpoint for portfolio data
app.get('/api/zerion/portfolio/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Validate address format
    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ error: 'Invalid Ethereum address format' });
    }
    
    const response = await axios.get(`${ZERION_V1_BASE_URL}/wallets/${address}/portfolio`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${encodedApiKey}`
      }
    });
    
    const { attributes } = response.data.data;
    
    const portfolioData = {
      totalValue: attributes.total.positions,
      chainDistribution: attributes.positions_distribution_by_chain,
      positionTypes: attributes.positions_distribution_by_type,
      changes: {
        absolute_1d: attributes.changes.absolute_1d,
        percent_1d: attributes.changes.percent_1d
      }
    };
    
    res.json(portfolioData);
  } catch (error) {
    console.error('Error fetching portfolio from Zerion:', error);
    res.status(500).json({ 
      error: error.response?.data?.message || 'Failed to fetch portfolio data from Zerion' 
    });
  }
});

// Proxy endpoint for positions data
app.get('/api/zerion/positions/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Validate address format
    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ error: 'Invalid Ethereum address format' });
    }
    
    const response = await axios.get(
      `${ZERION_V1_BASE_URL}/wallets/${address}/positions?filter[positions]=only_simple&currency=usd&filter[trash]=only_non_trash&sort=value`, 
      {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Basic ${encodedApiKey}`
        }
      }
    );
    
    const data = response.data;
    
    let totalValue = 0;
    const positions = data.data.map(position => {
      const value = position.attributes.value || 0;
      totalValue += value;
      
      return {
        name: position.attributes.fungible_info.name,
        symbol: position.attributes.fungible_info.symbol,
        balance: position.attributes.quantity.float.toString(),
        usdPrice: position.attributes.price || 0,
        usdValue: position.attributes.value || 0,
        chain: position.relationships.chain.data.id,
        change24h: position.attributes.changes?.percent_1d || null,
        verified: position.attributes.fungible_info.flags.verified
      };
    });
    
    res.json({
      positions,
      totalValue
    });
  } catch (error) {
    console.error('Error fetching positions from Zerion:', error);
    res.status(500).json({ 
      error: error.response?.data?.message || 'Failed to fetch position data from Zerion' 
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
}); 
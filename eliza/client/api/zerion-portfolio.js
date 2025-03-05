import axios from 'axios';

// Zerion API base URL
const ZERION_V1_BASE_URL = 'https://api.zerion.io/v1';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { address } = req.query;
    
    // Validate address format
    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ error: 'Invalid Ethereum address format' });
    }
    
    // Get API key from environment variables
    const ZERION_API_KEY = process.env.ZERION_API_KEY;
    
    if (!ZERION_API_KEY) {
      console.error('Zerion API key not configured');
      return res.status(500).json({ error: 'Zerion API key not configured' });
    }
    
    // Encode API key for Basic Auth
    const encodedApiKey = Buffer.from(`${ZERION_API_KEY}:`).toString('base64');
    
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
    
    return res.status(200).json(portfolioData);
  } catch (error) {
    console.error('Error fetching portfolio from Zerion:', error);
    return res.status(500).json({ 
      error: error.response?.data?.message || 'Failed to fetch portfolio data from Zerion' 
    });
  }
} 
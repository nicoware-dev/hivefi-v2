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
    
    return res.status(200).json({
      positions,
      totalValue
    });
  } catch (error) {
    console.error('Error fetching positions from Zerion:', error);
    return res.status(500).json({ 
      error: error.response?.data?.message || 'Failed to fetch position data from Zerion' 
    });
  }
} 
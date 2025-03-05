import axios from 'axios';

// DefiLlama API base URL
const DEFILLAMA_BASE_URL = 'https://api.llama.fi';

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
    const response = await axios.get(`${DEFILLAMA_BASE_URL}/charts/tvl`);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching TVL data from DefiLlama:', error);
    return res.status(500).json({ 
      error: error.response?.data?.message || 'Failed to fetch TVL data from DefiLlama' 
    });
  }
} 
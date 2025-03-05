import axios from 'axios';

// Privy API base URL
const PRIVY_BASE_URL = 'https://auth.privy.io/api/v1';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Forward the request to Privy
    const response = await axios.post(
      `${PRIVY_BASE_URL}/analytics_events`,
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          // Forward any authorization headers
          ...(req.headers.authorization && { Authorization: req.headers.authorization }),
        },
      }
    );

    // Return the response from Privy
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error proxying request to Privy:', error.message);
    
    // Return error response
    res.status(error.response?.status || 500).json({
      error: 'Error proxying request to Privy',
      details: error.message
    });
  }
} 
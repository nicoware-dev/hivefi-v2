// Privy OAuth proxy for handling social login redirects
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
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Get the redirect URL from the query parameters
    const { redirect_uri } = req.query;
    
    if (redirect_uri) {
      // Redirect to the specified URL
      res.redirect(302, redirect_uri);
    } else {
      // If no redirect_uri is provided, redirect to the app's home page
      res.redirect(302, '/');
    }
  } catch (error) {
    console.error('Error handling Privy OAuth redirect:', error.message);
    
    // Return error response
    res.status(500).json({
      error: 'Error handling Privy OAuth redirect',
      details: error.message
    });
  }
} 
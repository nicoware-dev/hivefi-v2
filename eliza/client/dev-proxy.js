// Development proxy server for handling Privy OAuth redirects
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// Handle Privy OAuth redirects
app.get('/api/privy-oauth', (req, res) => {
  console.log('Received Privy OAuth redirect:', req.query);
  
  // Get the redirect URL from the query parameters
  const { redirect_uri } = req.query;
  
  if (redirect_uri) {
    // Redirect to the specified URL
    console.log('Redirecting to:', redirect_uri);
    res.redirect(302, redirect_uri);
  } else {
    // If no redirect_uri is provided, redirect to the app's home page
    console.log('No redirect_uri provided, redirecting to home page');
    res.redirect(302, 'http://localhost:5173');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Privy OAuth proxy server running at http://localhost:${port}`);
  console.log(`Handling redirects at http://localhost:${port}/api/privy-oauth`);
}); 
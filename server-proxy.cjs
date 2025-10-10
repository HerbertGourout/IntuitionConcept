const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Proxy pour Anthropic
app.post('/api/anthropic/v1/messages', async (req, res) => {
  const apiKey = process.env.VITE_ANTHROPIC_API_KEY;
  
  console.log('🔑 Anthropic Key present:', !!apiKey);
  console.log('📦 Request body size:', JSON.stringify(req.body).length);
  
  if (!apiKey) {
    return res.status(500).json({ error: 'VITE_ANTHROPIC_API_KEY not configured' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    console.log('✅ Anthropic response:', response.status);
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('❌ Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
  console.log(`🔑 Anthropic key configured: ${!!process.env.VITE_ANTHROPIC_API_KEY}`);
});

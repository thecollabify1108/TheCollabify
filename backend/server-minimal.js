const express = require('express');
const http = require('http');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Simple health checks
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Minimal server running!' });
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        port: PORT,
        env: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.json({ message: 'TheCollabify API is running on Azure!' });
});

// Start server
const server = http.createServer(app);

server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server listening on port ${PORT}`);
});

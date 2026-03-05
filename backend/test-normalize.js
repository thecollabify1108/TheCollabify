const { body, validationResult } = require('express-validator');
const express = require('express');
const app = express();
app.use(express.json());
app.post('/test', [
    body('email').isEmail().normalizeEmail()
], (req, res) => {
    const email = req.body.email; // after normalization
    console.log('Original via req.body:', req.body.email);
    res.json({ normalizedEmail: req.body.email });
});
const server = app.listen(9999, () => {
    const https = require('http');
    const data = JSON.stringify({ email: 'admin@thecollabify.tech' });
    const req = https.request({ hostname: 'localhost', port: 9999, path: '/test', method: 'POST', headers: { 'Content-Type': 'application/json' } }, res => {
        let b = '';
        res.on('data', d => b += d);
        res.on('end', () => { console.log('Result:', b); server.close(); });
    });
    req.write(data);
    req.end();
});

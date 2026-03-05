const https = require('https');
const data = JSON.stringify({ email: 'admin@thecollabify.tech', password: 'Admin@Collabify2026' });
const options = {
    hostname: 'thecollabify-api-hhc2huheexeqaqff.centralindia-01.azurewebsites.net',
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
};
const req = https.request(options, res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
        console.log('STATUS:', res.statusCode);
        console.log('BODY:', body);
    });
});
req.on('error', e => console.error('ERROR:', e.message));
req.write(data);
req.end();

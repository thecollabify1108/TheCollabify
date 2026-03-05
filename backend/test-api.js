const https = require('https');

function makeRequest(path, method, data, cb) {
    const body = data ? JSON.stringify(data) : null;
    const opts = {
        hostname: 'thecollabify-api-hhc2huheexeqaqff.centralindia-01.azurewebsites.net',
        path, method,
        headers: body ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } : {},
        timeout: 60000
    };
    const req = https.request(opts, res => {
        let result = '';
        res.on('data', d => result += d);
        res.on('end', () => cb(null, res.statusCode, result));
    });
    req.on('timeout', () => { req.destroy(); cb(new Error('TIMEOUT')); });
    req.on('error', cb);
    if (body) req.write(body);
    req.end();
}

console.log('1. Pinging server...');
makeRequest('/api/ping', 'GET', null, (err, status, body) => {
    if (err) { console.log('Ping FAILED:', err.message); process.exit(1); }
    console.log('Ping OK:', status, body);

    console.log('\n2. Testing login...');
    makeRequest('/api/auth/login', 'POST', { email: 'admin@thecollabify.tech', password: 'Admin@Collabify2026' }, (err2, status2, body2) => {
        if (err2) { console.log('Login FAILED:', err2.message); process.exit(1); }
        console.log('Login STATUS:', status2);
        console.log('Login BODY:', body2);
    });
});

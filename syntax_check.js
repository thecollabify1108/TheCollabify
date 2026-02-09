const fs = require('fs');
const path = require('path');
const file = 'c:\\Users\\sukhv\\project 2\\backend\\services\\aiMatching.js';

try {
    const content = fs.readFileSync(file, 'utf8');
    new Function(content); // Try to parse usage new Function
    console.log('Syntax OK');
} catch (e) {
    console.log('Syntax Error:', e.message);
}

const webpush = require('web-push');
const keys = webpush.generateVAPIDKeys();
console.log('---START_KEYS---');
console.log(keys.publicKey);
console.log(keys.privateKey);
console.log('---END_KEYS---');

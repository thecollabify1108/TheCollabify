const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Only in development: log queries
if (process.env.NODE_ENV === 'development') {
    prisma.$on('query', (e) => {
        console.log('Query: ' + e.query);
        console.log('Params: ' + e.params);
        console.log('Duration: ' + e.duration + 'ms');
    });
}

module.exports = prisma;

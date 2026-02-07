const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    console.log('Testing connection...');
    try {
        await prisma.$connect();
        console.log('✅ Prisma connected successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Prisma connection failed:', error);
        process.exit(1);
    }
}

test();

// Verify migrated data
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const userCount = await prisma.user.count();
        const profileCount = await prisma.creatorProfile.count();
        const requestCount = await prisma.promotionRequest.count();

        console.log('✅ Migration Verification:');
        console.log(`- Users: ${userCount}`);
        console.log(`- Creator Profiles: ${profileCount}`);
        console.log(`- Promotion Requests: ${requestCount}`);

        if (userCount > 0) {
            const sampleUser = await prisma.user.findFirst({ include: { roles: true } });
            console.log('\nSample User:', {
                name: sampleUser.name,
                email: sampleUser.email,
                roles: sampleUser.roles.map(r => r.type)
            });
        }

    } catch (err) {
        console.error('❌ Verification failed:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();

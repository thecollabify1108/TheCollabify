const prisma = require('./config/prisma');
const bcrypt = require('bcryptjs');

async function main() {
    // Get the ADMIN role directly
    const role = await prisma.userRole.findFirst({ where: { type: 'ADMIN' } });
    console.log('Role ID:', role.id);
    console.log('Hash in DB:', role.password);

    const match = await bcrypt.compare('Admin@Collabify2026', role.password);
    console.log('bcrypt match locally:', match);

    // Also check via user lookup (same as login route)
    const user = await prisma.user.findUnique({
        where: { email: 'admin@thecollabify.tech' },
        include: { roles: true }
    });
    console.log('\nUser lookup:');
    console.log('Found:', !!user, '| isActive:', user?.isActive, '| roles:', user?.roles?.length);
    for (const r of (user?.roles || [])) {
        const m = await bcrypt.compare('Admin@Collabify2026', r.password);
        console.log('Role', r.type, '| match:', m, '| same hash:', r.password === role.password);
    }

    await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });

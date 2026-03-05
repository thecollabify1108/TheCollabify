const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const email = 'admin@thecollabify.tech';
    const pass = 'Admin@Collabify2026';
    const hashed = await bcrypt.hash(pass, 12);

    console.log(`Fixing admin: ${email}`);

    // 1. Ensure user exists and has main password set
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashed,
            activeRole: 'ADMIN',
            role: 'ADMIN',
            isActive: true
        },
        create: {
            email,
            password: hashed,
            name: 'Admin',
            activeRole: 'ADMIN',
            role: 'ADMIN',
            authProvider: 'LOCAL'
        }
    });

    // 2. Ensure ADMIN role entry exists in UserRole table with SAME password
    const existingRoles = await prisma.userRole.findMany({
        where: { userId: user.id }
    });

    const hasAdminRole = existingRoles.some(r => r.type === 'ADMIN');

    if (hasAdminRole) {
        await prisma.userRole.updateMany({
            where: { userId: user.id, type: 'ADMIN' },
            data: { password: hashed }
        });
        console.log('Updated existing ADMIN role password');
    } else {
        await prisma.userRole.create({
            data: {
                userId: user.id,
                type: 'ADMIN',
                password: hashed
            }
        });
        console.log('Created missing ADMIN role entry');
    }

    console.log('SUCCESS: Admin account synchronized with verified password.');
}

main()
    .catch(err => {
        console.error('ERROR:', err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());

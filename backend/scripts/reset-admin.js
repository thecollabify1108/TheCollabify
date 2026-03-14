const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@thecollabify.tech';
    const password = 'AdminPassword2026!';
    const name = 'TheCollabify Admin';

    console.log(`Resetting admin account: ${email}`);
    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            activeRole: 'ADMIN',
            emailVerified: true,
            isActive: true,
        },
        create: {
            email,
            name,
            password: hashedPassword,
            activeRole: 'ADMIN',
            authProvider: 'LOCAL',
            emailVerified: true,
            isActive: true,
            roles: {
                create: {
                    type: 'ADMIN',
                    password: hashedPassword
                }
            }
        }
    });

    console.log(`✅ Admin account ready: ${admin.email}`);
    console.log(`Password: ${password}`);
}

main()
    .catch((e) => {
        console.error('❌ Failed:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());

/**
 * Prisma Seed Script
 * Creates the initial admin account for TheCollabify platform.
 *
 * Usage:
 *   cd backend
 *   npx prisma db seed
 *
 * Environment variables (set in .env or Azure App Settings):
 *   ADMIN_EMAIL    — admin email address (default: admin@thecollabify.tech)
 *   ADMIN_PASSWORD — admin password (must be strong; no default — required)
 *   ADMIN_NAME     — admin display name (default: TheCollabify Admin)
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = process.env.ADMIN_EMAIL || 'admin@thecollabify.tech';
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME || 'TheCollabify Admin';

    if (!password) {
        console.error('❌ ADMIN_PASSWORD environment variable is required. Set it before running the seed.');
        process.exit(1);
    }

    console.log(`🌱 Seeding admin account: ${email}`);

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
        console.log(`ℹ️  Admin account already exists (${email}). Skipping creation.`);
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await prisma.user.create({
        data: {
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

    console.log(`✅ Admin account created: ${admin.email} (id: ${admin.id})`);
    console.log('   Log in at https://thecollabify.tech/login with your ADMIN_PASSWORD.');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e.message);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());

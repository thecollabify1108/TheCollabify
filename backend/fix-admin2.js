const prisma = require('./config/prisma');
const bcrypt = require('bcryptjs');

async function main() {
    const email = 'admin@thecollabify.tech';
    const password = 'Admin@Collabify2026';
    const hashed = await bcrypt.hash(password, 12);

    // Update BOTH User.password and UserRole.password
    await prisma.user.update({
        where: { email },
        data: {
            password: hashed,           // User.password field
            authProvider: 'LOCAL',
            isActive: true,
            emailVerified: true,
            activeRole: 'ADMIN',
            roles: {
                updateMany: {
                    where: { type: 'ADMIN' },
                    data: { password: hashed }  // UserRole.password field
                }
            }
        }
    });

    // Verify
    const user = await prisma.user.findUnique({ where: { email }, include: { roles: true } });
    const matchUser = await bcrypt.compare(password, user.password);
    const matchRole = await bcrypt.compare(password, user.roles[0].password);
    console.log('User.password match:', matchUser);
    console.log('UserRole.password match:', matchRole);
    console.log('Email:', email, '| Password:', password);
    await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });

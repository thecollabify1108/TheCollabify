// Verify all tables were created
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Checking tables in thecollabify_production...\n');

        const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;

        console.log('✅ Tables created in Azure PostgreSQL:');
        tables.forEach((t, i) => {
            console.log(`  ${i + 1}. ${t.table_name}`);
        });

        console.log(`\n✅ Total: ${tables.length} tables`);

        await prisma.$disconnect();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main();

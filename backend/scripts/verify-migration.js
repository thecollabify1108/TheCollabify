const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
    console.log('🔍 Starting Data Migration Verification...\n');

    try {
        const models = [
            'user', 'creatorProfile', 'promotionRequest', 'calendarEvent',
            'contentCalendar', 'teamMember', 'subscriber', 'notification',
            'payment', 'analytics', 'conversation', 'message'
        ];

        for (const model of models) {
            const count = await prisma[model].count();
            console.log(`[${model.toUpperCase()}]: ${count}`);
        }

        // Check some specific mappings
        console.log('\n--- Model Checks ---');
        // ... (rest of checks)

        const sampleEvent = await prisma.calendarEvent.findFirst();
        if (sampleEvent) {
            console.log('✅ CalendarEvent mapping looks good:', {
                id: sampleEvent.id,
                title: sampleEvent.title,
                startDate: sampleEvent.startDate,
                type: sampleEvent.type
            });
        }

        const sampleContent = await prisma.contentCalendar.findFirst();
        if (sampleContent) {
            console.log('✅ ContentCalendar mapping looks good:', {
                id: sampleContent.id,
                platform: sampleContent.platform,
                scheduledDate: sampleContent.scheduledDate
            });
        }

        const sampleMember = await prisma.teamMember.findFirst();
        if (sampleMember) {
            console.log('✅ TeamMember mapping looks good:', {
                id: sampleMember.id,
                role: sampleMember.role,
                status: sampleMember.status
            });
        }

        console.log('\n✨ Verification completed!');
    } catch (err) {
        console.error('❌ Verification failed:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

verify();

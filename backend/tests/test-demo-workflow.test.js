/**
 * DEMO WORKFLOW INTEGRATION TEST
 * 
 * Tests complete seller-creator workflow:
 * 1. Create demo users & data
 * 2. Seller creates profile & campaign
 * 3. Creator browses & receives offer
 * 4. Conversation exchange
 * 5. Collaboration accepted
 * 
 * Run with: npm test -- test-demo-workflow.test.js
 */

const request = require('supertest');
const app = require('../app');
const prisma = require('../config/prisma');

describe('📱 DEMO WORKFLOW - Complete Seller-Creator Journey', () => {
    let sellerId, sellerToken, creatorId, creatorToken, campaignId, conversationId;

    beforeAll(async () => {
        // Clean any existing demo users
        try {
            await prisma.user.deleteMany({
                where: { email: { contains: 'demo-workflow-test-' } }
            });
        } catch (e) {
            console.log('Note: Cleanup skipped (expected if no demo users exist)');
        }
    });

    afterAll(async () => {
        // Clean up after tests
        try {
            await prisma.user.deleteMany({
                where: { email: { contains: 'demo-workflow-test-' } }
            });
        } catch (e) {
            console.log('Note: Cleanup failed but not blocking');
        }
    });

    // ============================================================
    // PHASE 1: CREATE DEMO USERS
    // ============================================================

    test('✅ Create complete demo users & environment', async () => {
        const response = await request(app)
            .post('/api/demo/create-demo-users')
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.seller).toBeDefined();
        expect(response.body.data.creators.length).toBe(3);
        expect(response.body.data.campaign).toBeDefined();
        expect(response.body.data.conversation).toBeDefined();

        // Extract for use in following tests
        sellerId = response.body.data.seller.userId;
        sellerToken = response.body.data.seller.token;
        creatorId = response.body.data.creators[0].userId;
        creatorToken = response.body.data.creators[0].token;
        campaignId = response.body.data.campaign.id;
        conversationId = response.body.data.conversation.id;

        console.log('✅ Demo Environment Created:');
        console.log(`   Seller: ${sellerId}`);
        console.log(`   Creator: ${creatorId}`);
        console.log(`   Campaign: ${campaignId}`);
        console.log(`   Conversation: ${conversationId}`);
    });

    // ============================================================
    // PHASE 2: SELLER WORKFLOW
    // ============================================================

    test('✅ [SELLER] Get own profile', async () => {
        const response = await request(app)
            .get('/api/sellers/profile')
            .set('Authorization', `Bearer ${sellerToken}`)
            .expect(200);

        expect(response.body.data).toBeDefined();
        expect(response.body.data.companyName).toBe('Fashion Brand Co');
    });

    test('✅ [SELLER] Get own campaigns', async () => {
        const response = await request(app)
            .get('/api/sellers/campaigns')
            .set('Authorization', `Bearer ${sellerToken}`)
            .expect(200);

        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('✅ [SELLER] View matched creators for campaign', async () => {
        const response = await request(app)
            .get(`/api/sellers/campaign/${campaignId}/matches`)
            .set('Authorization', `Bearer ${sellerToken}`)
            .expect(200);

        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
        expect(response.body.data[0].matchScore).toBeDefined();
    });

    // ============================================================
    // PHASE 3: MESSAGING WORKFLOW
    // ============================================================

    test('✅ [SELLER] Send initial message in conversation', async () => {
        const messageContent = 'Hey creator! Love your work. Interested in our campaign?';
        
        const response = await request(app)
            .post(`/api/chat/${conversationId}/message`)
            .set('Authorization', `Bearer ${sellerToken}`)
            .send({ content: messageContent })
            .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.content).toBe(messageContent);
        expect(response.body.data.senderId).toBe(sellerId);
    });

    test('✅ [CREATOR] Get all conversations', async () => {
        const response = await request(app)
            .get('/api/chat/conversations')
            .set('Authorization', `Bearer ${creatorToken}`)
            .expect(200);

        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('✅ [CREATOR] View conversation history', async () => {
        const response = await request(app)
            .get(`/api/chat/${conversationId}/messages`)
            .set('Authorization', `Bearer ${creatorToken}`)
            .expect(200);

        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(1); // at least 2 messages now
    });

    test('✅ [CREATOR] Reply to seller', async () => {
        const messageContent = 'Absolutely interested! What's the budget and timeline?';
        
        const response = await request(app)
            .post(`/api/chat/${conversationId}/message`)
            .set('Authorization', `Bearer ${creatorToken}`)
            .send({ content: messageContent })
            .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.senderId).toBe(creatorId);
    });

    test('✅ [SELLER] Continue conversation', async () => {
        const messageContent = '$1500 for 2 posts and 1 reel. Timeline: 2 weeks. Sound good?';
        
        const response = await request(app)
            .post(`/api/chat/${conversationId}/message`)
            .set('Authorization', `Bearer ${sellerToken}`)
            .send({ content: messageContent })
            .expect(201);

        expect(response.body.success).toBe(true);
    });

    // ============================================================
    // PHASE 4: CREATOR WORKFLOW
    // ============================================================

    test('✅ [CREATOR] Get creator profile', async () => {
        const response = await request(app)
            .get('/api/creators/profile')
            .set('Authorization', `Bearer ${creatorToken}`)
            .expect(200);

        expect(response.body.data).toBeDefined();
        expect(response.body.data.followerCount).toBeGreaterThan(0);
        expect(response.body.data.category).toBeDefined();
    });

    test('✅ [CREATOR] Browse campaigns', async () => {
        const response = await request(app)
            .get('/api/creators/campaigns')
            .set('Authorization', `Bearer ${creatorToken}`)
            .expect(200);

        expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('✅ [CREATOR] Get campaign details', async () => {
        const response = await request(app)
            .get(`/api/creators/campaigns/${campaignId}`)
            .set('Authorization', `Bearer ${creatorToken}`)
            .expect(200);

        expect(response.body.data).toBeDefined();
        expect(response.body.data.id).toBe(campaignId);
        expect(response.body.data.title).toBeDefined();
    });

    // ============================================================
    // PHASE 5: COLLABORATION WORKFLOW
    // ============================================================

    test('✅ [CREATOR] Accept collaboration offer', async () => {
        const response = await request(app)
            .post(`/api/chat/${conversationId}/accept`)
            .set('Authorization', `Bearer ${creatorToken}`)
            .send({
                agreedAmount: 1500,
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                deliverables: {
                    posts: 2,
                    reels: 1,
                    stories: 3
                }
            })
            .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
    });

    test('✅ [SELLER] View active collaborations', async () => {
        const response = await request(app)
            .get('/api/sellers/collaborations')
            .set('Authorization', `Bearer ${sellerToken}`)
            .expect(200);

        expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('✅ [CREATOR] View active collaborations', async () => {
        const response = await request(app)
            .get('/api/creators/collaborations')
            .set('Authorization', `Bearer ${creatorToken}`)
            .expect(200);

        expect(Array.isArray(response.body.data)).toBe(true);
    });

    // ============================================================
    // PHASE 6: DATA CLEANUP
    // ============================================================

    test('✅ Clean demo data', async () => {
        const response = await request(app)
            .post('/api/demo/clean-demo-data')
            .expect(200);

        expect(response.body.success).toBe(true);
        console.log(`✅ ${response.body.message}`);
    });
});

describe('📱 DEMO ROUTES - Error Handling', () => {
    test('✅ Handle invalid conversation ID gracefully', async () => {
        const response = await request(app)
            .get('/api/chat/invalid-id/messages')
            .set('Authorization', `Bearer invalid-token`)
            .expect(401); // Unauthorized, not 500
    });

    test('✅ Get demo users when none exist', async () => {
        const response = await request(app)
            .get('/api/demo/demo-users')
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
    });
});

describe('📱 AUTH WITHOUT OTP - Verification', () => {
    test('✅ Register seller without OTP', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                email: `no-otp-seller-${Date.now()}@test.com`,
                name: 'No OTP Seller',
                password: 'Password@123',
                role: 'seller'
            })
            .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.token).toBeDefined();
        expect(response.body.data.user).toBeDefined();

        console.log('✅ Seller registered without OTP!');
    });

    test('✅ Register creator without OTP', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                email: `no-otp-creator-${Date.now()}@test.com`,
                name: 'No OTP Creator',
                password: 'Password@123',
                role: 'creator'
            })
            .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.token).toBeDefined();
    });
});

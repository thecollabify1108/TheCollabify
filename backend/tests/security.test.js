const request = require('supertest');
const prisma = require('../config/prisma');
const app = require('../app');
const { generateToken } = require('../middleware/auth');

// Mock Prisma for testing without real DB connection
jest.mock('../config/prisma', () => {
    return {
        user: {
            create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: Math.random().toString(36).substring(7), ...data })),
            findUnique: jest.fn().mockImplementation(({ where }) => Promise.resolve({ id: where.id, email: 'test@test.com', activeRole: 'CREATOR', name: 'Test User', isActive: true })),
            findFirst: jest.fn().mockResolvedValue({ id: '1', email: 'test@test.com', isActive: true }),
            deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
        creatorProfile: {
            create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: Math.random().toString(36).substring(7), ...data })),
            findUnique: jest.fn().mockResolvedValue({ id: 'creator1', userId: 'user1' }),
            deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
        promotionRequest: {
            create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: Math.random().toString(36).substring(7), ...data })),
            findUnique: jest.fn().mockResolvedValue({ id: 'promo1', sellerId: 'seller1' }),
            deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
        matchedCreator: {
            create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: Math.random().toString(36).substring(7), ...data })),
            findFirst: jest.fn().mockResolvedValue(null),
            findUnique: jest.fn().mockResolvedValue({ id: 'match1', status: 'MATCHED' }),
            update: jest.fn().mockResolvedValue({}),
            deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
        collaboration: {
            create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: Math.random().toString(36).substring(7), ...data })),
            findUnique: jest.fn().mockImplementation(({ where }) => Promise.resolve({ id: where.id, matchId: 'match1', status: 'IN_DISCUSSION', deliverables: [] })),
            findMany: jest.fn().mockResolvedValue([]),
            update: jest.fn().mockResolvedValue({}),
            deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
        conversation: {
            create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: Math.random().toString(36).substring(7), ...data })),
            findFirst: jest.fn().mockResolvedValue(null),
            findUnique: jest.fn().mockImplementation(({ where }) => Promise.resolve({ id: where.id, status: 'ACTIVE' })),
            update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'conv1', ...data })),
            deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
        message: {
            create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: Math.random().toString(36).substring(7), ...data })),
            deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
        $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
    };
});

describe('Backend Hardening Security Tests', () => {
    let sellerToken, creatorToken, otherToken;
    let seller, creator, otherUser;
    let promotion, match;

    beforeAll(async () => {
        // Setup users
        seller = await prisma.user.create({
            data: { email: 'seller@test.com', name: 'Seller', activeRole: 'SELLER', password: 'password' }
        });
        creatorUser = await prisma.user.create({
            data: { email: 'creator@test.com', name: 'Creator', activeRole: 'CREATOR', password: 'password' }
        });
        otherUser = await prisma.user.create({
            data: { email: 'other@test.com', name: 'Other', activeRole: 'CREATOR', password: 'password' }
        });

        // Create Creator Profile
        creator = await prisma.creatorProfile.create({
            data: {
                userId: creatorUser.id,
                category: 'Tech',
                minPrice: 100,
                maxPrice: 500,
                followerCount: 1000,
                engagementRate: 5.0
            }
        });

        sellerToken = generateToken(seller.id);
        creatorToken = generateToken(creatorUser.id);
        otherToken = generateToken(otherUser.id);

        // Setup data
        promotion = await prisma.promotionRequest.create({
            data: {
                title: 'Test Promotion',
                description: 'Test Description',
                sellerId: seller.id,
                status: 'OPEN',
                minBudget: 100,
                maxBudget: 500,
                promotionType: 'REELS',
                targetCategory: 'Tech',
                minFollowers: 100,
                maxFollowers: 10000,
                campaignGoal: 'REACH'
            }
        });

        match = await prisma.matchedCreator.create({
            data: {
                promotionId: promotion.id,
                creatorId: creator.id,
                status: 'MATCHED',
                matchScore: 85,
                matchReason: 'Good match'
            }
        });

        // Wait for app to initialize routes
        let attempts = 0;
        while (attempts < 10) {
            const res = await request(app).get('/api/ping');
            if (res.status === 200) break;
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }
    });

    afterAll(async () => {
        await prisma.collaboration.deleteMany();
        await prisma.conversation.deleteMany();
        await prisma.matchedCreator.deleteMany();
        await prisma.creatorProfile.deleteMany();
        await prisma.promotionRequest.deleteMany();
        await prisma.user.deleteMany();
    });

    describe('Messaging Gating', () => {
        it('should block messaging if match is MATCHED (Strict Gating)', async () => {
            // Setup mock for this specific call - chat uses findUnique for conversation
            prisma.conversation.findUnique.mockResolvedValueOnce({
                id: match.id,
                status: 'ACTIVE',
                promotionId: promotion.id,
                sellerId: seller.id,
                creatorUserId: creatorUser.id
            });

            // Gating logic uses findFirst or findUnique for match
            prisma.matchedCreator.findFirst.mockResolvedValueOnce({
                id: match.id,
                status: 'MATCHED',
                promotion: { sellerId: seller.id },
                creator: { userId: creatorUser.id }
            });

            const res = await request(app)
                .post(`/api/chat/conversations/${match.id}/messages`)
                .set('Authorization', `Bearer ${sellerToken}`)
                .send({ content: 'Hello' });

            expect(res.status).toBe(403);
            expect(res.body.message).toContain('Messaging is only available after');
        });

        it('should allow messaging after match is ACCEPTED', async () => {
            // Setup mock for connection check
            prisma.matchedCreator.findFirst.mockResolvedValue({
                id: match.id,
                status: 'ACCEPTED',
                promotion: { sellerId: seller.id },
                creator: { userId: creatorUser.id }
            });

            // We need a conversation for this to work in real app logic
            const conv = { id: 'conv1', promotionId: promotion.id, creatorUserId: creatorUser.id, sellerId: seller.id, status: 'ACTIVE' };

            // Mock conversation lookup
            prisma.conversation.findUnique.mockResolvedValue(conv);

            const res = await request(app)
                .post(`/api/chat/conversations/${conv.id}/messages`)
                .set('Authorization', `Bearer ${sellerToken}`)
                .send({ content: 'Hello after acceptance' });

            expect(res.status).toBe(201);
        });
    });

    describe('Collaboration IDOR', () => {
        let collaboration;

        beforeAll(async () => {
            collaboration = {
                id: 'collaboration1',
                matchId: match.id,
                status: 'IN_DISCUSSION',
                deliverables: ['Test deliverables']
            };
        });

        it('should block unauthorized user from viewing collaboration', async () => {
            prisma.collaboration.findUnique.mockResolvedValueOnce({
                ...collaboration,
                matchedCreator: {
                    promotion: { sellerId: seller.id },
                    creator: { userId: creatorUser.id }
                }
            });

            const res = await request(app)
                .get(`/api/collaboration/${match.id}`)
                .set('Authorization', `Bearer ${otherToken}`);

            expect(res.status).toBe(403);
        });

        it('should block unauthorized user from modifying collaboration', async () => {
            prisma.collaboration.findUnique.mockResolvedValueOnce({
                ...collaboration,
                matchedCreator: {
                    promotion: { sellerId: seller.id },
                    creator: { userId: creatorUser.id }
                }
            });

            const res = await request(app)
                .patch(`/api/collaboration/${collaboration.id}`)
                .set('Authorization', `Bearer ${otherToken}`)
                .send({ deliverables: ['Hacked deliverables'] });

            expect(res.status).toBe(403);
        });

        it('should allow seller to view collaboration', async () => {
            prisma.collaboration.findUnique.mockResolvedValueOnce({
                ...collaboration,
                matchedCreator: {
                    promotion: { sellerId: seller.id },
                    creator: { userId: creatorUser.id }
                }
            });

            const res = await request(app)
                .get(`/api/collaboration/${match.id}`)
                .set('Authorization', `Bearer ${sellerToken}`);

            expect(res.status).toBe(200);
        });
    });

    describe('Analytics IDOR', () => {
        it('should block unauthorized user from tracking outcome for other match', async () => {
            // Analytics uses findUnique
            prisma.matchedCreator.findUnique.mockResolvedValueOnce({
                id: match.id,
                promotion: { sellerId: seller.id },
                creator: { userId: creatorUser.id }
            });

            const res = await request(app)
                .post('/api/analytics/outcome')
                .set('Authorization', `Bearer ${otherToken}`)
                .send({ matchId: match.id, status: 'COMPLETED' });

            expect(res.status).toBe(403);
        });
    });
});

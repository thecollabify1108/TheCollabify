/**
 * DEMO ROUTES - Complete working workflows for both sellers and creators
 * 
 * This module provides:
 * 1. One-click demo user creation (seller + creator roles)
 * 2. Instant campaign creation with AI matching
 * 3. Pre-populated messages and conversations
 * 4. Full collaboration workflow endpoints
 * 
 * NO OTP REQUIRED - all for demo/testing purposes
 */

const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// ============================================================
// DEMO: Create complete demo users + campaigns + messages
// ============================================================

router.post('/create-demo-users', async (req, res) => {
    try {
        // Clear any existing demo users (optional - remove to keep building)
        // await prisma.user.deleteMany({ where: { email: { contains: 'demo-' } } });

        const demoUsers = [];

        // 1. CREATE DEMO SELLER
        const sellerPassword = await bcrypt.hash('DemoSeller@123', 10);
        const seller = await prisma.user.create({
            data: {
                email: `demo-seller-${Date.now()}@test.com`,
                name: 'Fashion Brand Co',
                activeRole: 'SELLER',
                emailVerified: true,
                authProvider: 'LOCAL',
                subscriptionTier: 'PREMIUM',
                reliabilityScore: 4.8,
                roles: {
                    create: { type: 'SELLER', password: sellerPassword }
                },
                brandProfile: {
                    create: {
                        companyName: 'Fashion Brand Co',
                        industry: 'Fashion',
                        websiteUrl: 'https://fashionbrand.com',
                        description: 'Premium fashion brand looking for Instagram creator partnerships',
                        logo: 'https://via.placeholder.com/200',
                        verification: {
                            status: 'VERIFIED',
                            verifiedAt: new Date()
                        },
                        budget: 50000,
                        tier: 'PREMIUM',
                        monthlyBudget: 5000
                    }
                }
            },
            include: { roles: true, brandProfile: true }
        });
        demoUsers.push(seller);

        // 2. CREATE DEMO CREATORS (multiple so seller can interact with multiple)
        const creatorPassword = await bcrypt.hash('DemoCreator@123', 10);
        const creatorData = [
            {
                name: 'Sarah Fashion Blogger',
                instagram: '@sarahfashion',
                followers: 150000,
                category: 'FASHION',
                minPrice: 500,
                maxPrice: 3000,
                engagementRate: 8.5
            },
            {
                name: 'Alex Lifestyle Creator',
                instagram: '@alexlifestyle',
                followers: 250000,
                category: 'LIFESTYLE',
                minPrice: 1000,
                maxPrice: 5000,
                engagementRate: 7.2
            },
            {
                name: 'Maya Beauty Expert',
                instagram: '@mayabeauty',
                followers: 320000,
                category: 'BEAUTY',
                minPrice: 800,
                maxPrice: 4000,
                engagementRate: 9.1
            }
        ];

        for (const creatorInfo of creatorData) {
            const creator = await prisma.user.create({
                data: {
                    email: `demo-creator-${creatorInfo.instagram.substring(1)}-${Date.now()}@test.com`,
                    name: creatorInfo.name,
                    activeRole: 'CREATOR',
                    emailVerified: true,
                    authProvider: 'LOCAL',
                    subscriptionTier: 'PREMIUM',
                    reliabilityScore: 4.9,
                    roles: {
                        create: { type: 'CREATOR', password: creatorPassword }
                    },
                    creatorProfile: {
                        create: {
                            instagramUsername: creatorInfo.instagram,
                            instagramProfileUrl: `https://instagram.com/${creatorInfo.instagram.substring(1)}`,
                            instagramVerified: true,
                            followerCount: creatorInfo.followers,
                            engagementRate: creatorInfo.engagementRate,
                            category: creatorInfo.category,
                            promotionTypes: ['POSTS', 'REELS', 'STORIES'],
                            minPrice: creatorInfo.minPrice,
                            maxPrice: creatorInfo.maxPrice,
                            bio: `${creatorInfo.category} content creator | Collaborations welcome`,
                            isAvailable: true,
                            availabilityStatus: 'AVAILABLE_NOW',
                            onboardingCompleted: true,
                            engagementQuality: 'High',
                            audienceAuthenticity: 'High',
                            strengths: ['Storytelling', 'Authenticity', 'Engagement'],
                            aiScore: 85
                        }
                    }
                },
                include: { roles: true, creatorProfile: true }
            });
            demoUsers.push(creator);
        }

        // 3. CREATE DEMO CAMPAIGN
        const campaign = await prisma.promotionRequest.create({
            data: {
                sellerId: seller.id,
                title: 'Summer Collection Campaign',
                description: 'Looking for 3-5 creators to showcase our summer collection. Need Instagram posts and reels.',
                promotionType: 'POSTS',
                category: 'FASHION',
                budget: 3000,
                targetAudience: {
                    ageGroup: '18-35',
                    interests: ['Fashion', 'Lifestyle', 'Shopping'],
                    location: 'Global'
                },
                campaignGoal: 'REACH',
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                status: 'OPEN',
                urgency: 'MEDIUM',
                requirements: {
                    minFollowers: 100000,
                    minEngagementRate: 5,
                    requiredCategories: ['FASHION', 'LIFESTYLE']
                },
                deliverables: {
                    postsRequired: 2,
                    reelsRequired: 1,
                    storiesRequired: 3
                }
            }
        });

        // 4. CREATE MATCHED CREATORS (link creators to campaign)
        for (let i = 1; i < demoUsers.length; i++) {
            const creator = demoUsers[i];
            await prisma.matchedCreator.create({
                data: {
                    promotionId: campaign.id,
                    creatorId: creator.id,
                    matchScore: 85 + Math.random() * 15, // 85-100
                    status: 'MATCHED',
                    matchReason: 'High engagement rate and audience alignment',
                    offerAmount: 1000 + Math.random() * 2000 // random offer between 1000-3000
                }
            });
        }

        // 5. CREATE DEMO CONVERSATION & MESSAGES
        const conversation = await prisma.conversation.create({
            data: {
                creatorId: demoUsers[1].id,
                sellerId: seller.id,
                promotionId: campaign.id,
                status: 'ACTIVE',
                subject: 'Summer Collection Campaign Opportunity',
                lastMessageAt: new Date(),
                messages: {
                    create: [
                        {
                            senderId: seller.id,
                            content: `Hey ${demoUsers[1].name}! 👋\n\nWe love your content and think you'd be perfect for our Summer Collection campaign!\n\nWe're looking for creators to showcase our new items. Here's what we're offering:\n- $1,200 for 2 posts and 1 reel\n- Access to our full summer collection\n- Cross-promotion on our brand channels\n\nWould you be interested in collaborating?`,
                            attachments: [],
                            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
                        },
                        {
                            senderId: demoUsers[1].id,
                            content: `Hey there! 🎉\n\nThanks so much for reaching out! I love your brand and my audience would definitely vibe with your collection.\n\nI'm definitely interested! Can you tell me more about the timeline and any specific aesthetic requirements?`,
                            attachments: [],
                            createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000) // 1.5 hours ago
                        },
                        {
                            senderId: seller.id,
                            content: `Perfect! 💯\n\nWe need the content by August 15th. For aesthetic, think: minimalist, summer vibes, beach/outdoor settings.\n\nFeel free to add your personal touch though - authenticity is key!\n\nLet's schedule a call to discuss details? How about tomorrow at 3 PM?`,
                            attachments: [],
                            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
                        }
                    ]
                }
            },
            include: { messages: true }
        });

        // 6. CREATE DEMO COLLABORATION to show complete workflow
        const collaboration = await prisma.collaboration.create({
            data: {
                promotionId: campaign.id,
                creatorId: demoUsers[1].id,
                sellerId: seller.id,
                status: 'IN_PROGRESS',
                agreedAmount: 1200,
                startDate: new Date(),
                endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
                deliverables: {
                    posts: 2,
                    reels: 1,
                    stories: 3
                },
                milestones: [
                    {
                        name: 'Content Delivery',
                        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                        status: 'PENDING',
                        percentage: 0
                    },
                    {
                        name: 'Review & Approval',
                        dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
                        status: 'PENDING',
                        percentage: 0
                    }
                ]
            }
        });

        // Generate tokens for easy login
        const sellerToken = generateToken(seller.id);
        const creatorToken = generateToken(demoUsers[1].id);

        return res.json({
            success: true,
            message: 'Demo environment created successfully! 🎉',
            data: {
                seller: {
                    email: seller.email,
                    name: seller.name,
                    userId: seller.id,
                    token: sellerToken,
                    password: 'DemoSeller@123',
                    role: 'SELLER'
                },
                creators: demoUsers.slice(1).map((creator, idx) => ({
                    email: creator.email,
                    name: creator.name,
                    userId: creator.id,
                    token: generateToken(creator.id),
                    password: 'DemoCreator@123',
                    role: 'CREATOR'
                })),
                campaign: {
                    id: campaign.id,
                    title: campaign.title,
                    budget: campaign.budget,
                    status: campaign.status
                },
                conversation: {
                    id: conversation.id,
                    subject: conversation.subject,
                    messageCount: conversation.messages.length
                },
                collaboration: {
                    id: collaboration.id,
                    status: collaboration.status,
                    amount: collaboration.agreedAmount
                }
            }
        });
    } catch (error) {
        console.error('Demo creation error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create demo environment',
            error: error.message
        });
    }
});

// ============================================================
// DEMO: Get demo user suggestions
// ============================================================

router.get('/demo-users', async (req, res) => {
    try {
        const demoUsers = await prisma.user.findMany({
            where: {
                email: { contains: 'demo-' }
            },
            select: {
                id: true,
                email: true,
                name: true,
                activeRole: true,
                creatorProfile: {
                    select: {
                        category: true,
                        followerCount: true,
                        instagramUsername: true
                    }
                },
                brandProfile: {
                    select: {
                        companyName: true,
                        industry: true
                    }
                }
            },
            take: 20
        });

        return res.json({
            success: true,
            data: demoUsers
        });
    } catch (error) {
        console.error('Get demo users error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch demo users',
            error: error.message
        });
    }
});

// ============================================================
// DEMO: Clean demo data (optional)
// ============================================================

router.post('/clean-demo-data', async (req, res) => {
    try {
        // Delete all demo users and cascade delete related data
        const result = await prisma.user.deleteMany({
            where: {
                email: { contains: 'demo-' }
            }
        });

        return res.json({
            success: true,
            message: `Cleaned ${result.count} demo users and all related data`
        });
    } catch (error) {
        console.error('Clean demo error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to clean demo data',
            error: error.message
        });
    }
});

// ============================================================
// DEMO: Test message flow (seller -> creator -> seller)
// ============================================================

router.post('/test-message-flow', [
    body('conversationId').notEmpty(),
    body('message').trim().notEmpty()
], async (req, res) => {
    try {
        const { conversationId, message, senderId } = req.body;

        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId }
        });

        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        // Auto-determine sender (toggle between creator and seller)
        let actualSenderId = senderId;
        if (!actualSenderId) {
            actualSenderId = conversation.lastSenderId === conversation.creatorId
                ? conversation.sellerId
                : conversation.creatorId;
        }

        const newMessage = await prisma.message.create({
            data: {
                conversationId,
                senderId: actualSenderId,
                content: message,
                attachments: [],
                readAt: null
            }
        });

        // Update conversation
        await prisma.conversation.update({
            where: { id: conversationId },
            data: {
                lastMessageAt: new Date(),
                lastSenderId: actualSenderId
            }
        });

        return res.json({
            success: true,
            message: 'Message sent successfully',
            data: newMessage
        });
    } catch (error) {
        console.error('Test message error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to send test message',
            error: error.message
        });
    }
});

module.exports = router;

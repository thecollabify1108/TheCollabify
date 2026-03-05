/**
 * seed-demo.js
 * Creates 20 demo creator profiles and 5 demo brand campaigns for pitch demos.
 * Run: node scripts/seed-demo.js
 * WARNING: This inserts new records only — it will skip emails that already exist.
 */

require('dotenv').config({ path: '../.env' });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'Demo@Collabify2025';

const creators = [
  { name: 'Aanya Sharma', email: 'aanya@demo-creators.co', insta: 'aanya.creates', followers: 124000, engagement: 4.8, category: 'Fashion', aiScore: 87, riskLevel: 'low', compositeRisk: 8.2, bio: 'Fashion and lifestyle content creator based in Mumbai.' },
  { name: 'Rohan Mehta', email: 'rohan@demo-creators.co', insta: 'rohanfitlife', followers: 89500, engagement: 6.2, category: 'Fitness', aiScore: 91, riskLevel: 'low', compositeRisk: 5.1, bio: 'Certified personal trainer and fitness content creator.' },
  { name: 'Priya Nair', email: 'priya@demo-creators.co', insta: 'priya.eats', followers: 210000, engagement: 3.4, category: 'Food', aiScore: 74, riskLevel: 'medium', compositeRisk: 31.5, bio: 'Food blogger and recipe developer from Bangalore.' },
  { name: 'Dev Kapoor', email: 'dev@demo-creators.co', insta: 'devtechtalks', followers: 54000, engagement: 7.9, category: 'Tech', aiScore: 88, riskLevel: 'low', compositeRisk: 9.7, bio: 'Software engineer sharing tech insights and gadget reviews.' },
  { name: 'Meera Joshi', email: 'meera@demo-creators.co', insta: 'meeratravels', followers: 178000, engagement: 5.1, category: 'Travel', aiScore: 82, riskLevel: 'low', compositeRisk: 14.3, bio: 'Solo travel storyteller covering destinations across South Asia.' },
  { name: 'Kabir Singh', email: 'kabir@demo-creators.co', insta: 'kabirwellness', followers: 67000, engagement: 8.3, category: 'Health', aiScore: 93, riskLevel: 'low', compositeRisk: 4.8, bio: 'Ayurveda-based wellness creator and yoga instructor.' },
  { name: 'Ishaan Verma', email: 'ishaan@demo-creators.co', insta: 'ishaangames', followers: 310000, engagement: 2.9, category: 'Gaming', aiScore: 69, riskLevel: 'medium', compositeRisk: 38.2, bio: 'Gaming streamer and esports commentator.' },
  { name: 'Tara Patel', email: 'tara@demo-creators.co', insta: 'tarabeautyco', followers: 145000, engagement: 5.6, category: 'Beauty', aiScore: 85, riskLevel: 'low', compositeRisk: 11.6, bio: 'Clean beauty advocate and skincare content creator.' },
  { name: 'Arnav Gupta', email: 'arnav@demo-creators.co', insta: 'arnavsounds', followers: 42000, engagement: 9.1, category: 'Music', aiScore: 89, riskLevel: 'low', compositeRisk: 6.3, bio: 'Independent musician and music production content creator.' },
  { name: 'Simran Kaur', email: 'simran@demo-creators.co', insta: 'simranlifestyle', followers: 95000, engagement: 4.3, category: 'Lifestyle', aiScore: 80, riskLevel: 'low', compositeRisk: 17.8, bio: 'Everyday lifestyle creator from Delhi, focusing on minimal living.' },
  { name: 'Nikhil Rao', email: 'nikhil@demo-creators.co', insta: 'nikhiledtech', followers: 38000, engagement: 10.2, category: 'Education', aiScore: 95, riskLevel: 'low', compositeRisk: 2.4, bio: 'UPSC mentor and educational content creator for competitive exams.' },
  { name: 'Avni Desai', email: 'avni@demo-creators.co', insta: 'avniartworld', followers: 62000, engagement: 7.4, category: 'Art', aiScore: 86, riskLevel: 'low', compositeRisk: 10.1, bio: 'Digital artist and illustration creator based in Ahmedabad.' },
  { name: 'Yash Malhotra', email: 'yash@demo-creators.co', insta: 'yashinbusiness', followers: 51000, engagement: 6.8, category: 'Business', aiScore: 83, riskLevel: 'low', compositeRisk: 13.5, bio: 'Startup founder sharing business strategy and growth frameworks.' },
  { name: 'Diya Chandra', email: 'diya@demo-creators.co', insta: 'diyasports', followers: 88000, engagement: 5.5, category: 'Sports', aiScore: 78, riskLevel: 'low', compositeRisk: 19.2, bio: 'Former national-level swimmer turned sports content creator.' },
  { name: 'Siddharth Kumar', email: 'siddharth@demo-creators.co', insta: 'siddharthtech', followers: 420000, engagement: 2.1, category: 'Tech', aiScore: 61, riskLevel: 'high', compositeRisk: 58.7, bio: 'Tech reviewer with high follower count and engagement anomalies flagged.' },
  { name: 'Pooja Iyer', email: 'pooja@demo-creators.co', insta: 'poojafashion', followers: 73000, engagement: 6.7, category: 'Fashion', aiScore: 84, riskLevel: 'low', compositeRisk: 12.9, bio: 'Sustainable fashion advocate and ethical lifestyle creator.' },
  { name: 'Akash Bose', email: 'akash@demo-creators.co', insta: 'akashfitpro', followers: 112000, engagement: 5.0, category: 'Fitness', aiScore: 77, riskLevel: 'low', compositeRisk: 20.4, bio: 'Functional fitness coach and sports nutrition content creator.' },
  { name: 'Riya Seth', email: 'riya@demo-creators.co', insta: 'riyacooks', followers: 160000, engagement: 4.1, category: 'Food', aiScore: 72, riskLevel: 'medium', compositeRisk: 27.8, bio: 'Home cooking creator specializing in regional Indian cuisines.' },
  { name: 'Varun Anand', email: 'varun@demo-creators.co', insta: 'varunwanders', followers: 195000, engagement: 3.8, category: 'Travel', aiScore: 76, riskLevel: 'low', compositeRisk: 22.1, bio: 'Adventure travel photographer documenting offbeat Indian destinations.' },
  { name: 'Naina Chopra', email: 'naina@demo-creators.co', insta: 'nainaglows', followers: 83000, engagement: 7.0, category: 'Beauty', aiScore: 90, riskLevel: 'low', compositeRisk: 7.9, bio: 'Dermatologist-backed skincare creator focused on evidence-based beauty.' },
];

const campaigns = [
  {
    sellerEmail: 'brand.glowskin@demo-brands.co',
    sellerName: 'GlowSkin Labs',
    title: 'GlowSkin Hydration Serum — Creator Launch Campaign',
    description: 'We are launching our new Vitamin C + Hyaluronic Acid serum and need authentic beauty and skincare creators to review the product through Instagram Reels. Looking for creators with a genuine skincare-focused audience and verifiable engagement rates.',
    minBudget: 15000,
    maxBudget: 45000,
    category: 'Beauty',
    promotionType: 'REELS',
    goal: 'SALES',
    minFollowers: 50000,
    maxFollowers: 300000,
  },
  {
    sellerEmail: 'brand.fuelup@demo-brands.co',
    sellerName: 'FuelUp Nutrition',
    title: 'FuelUp Protein Bar — Fitness Creator Partnership',
    description: 'FuelUp is India\'s fastest-growing protein snack brand. We need fitness creators to feature our high-protein bars in training, post-workout, and daily routine content. Genuine fitness audiences preferred.',
    minBudget: 8000,
    maxBudget: 25000,
    category: 'Fitness',
    promotionType: 'POSTS',
    goal: 'REACH',
    minFollowers: 30000,
    maxFollowers: 200000,
  },
  {
    sellerEmail: 'brand.wanderlux@demo-brands.co',
    sellerName: 'WanderLux Travel',
    title: 'WanderLux Destination Series — Content Collaboration',
    description: 'WanderLux is partnering with travel creators for our 2025 destination series. We want authentic storytelling across domestic Indian hill stations, beaches, and cultural destinations. Looking for creators who have documented real travel experiences.',
    minBudget: 20000,
    maxBudget: 60000,
    category: 'Travel',
    promotionType: 'REELS',
    goal: 'TRAFFIC',
    minFollowers: 80000,
    maxFollowers: 500000,
  },
  {
    sellerEmail: 'brand.techflow@demo-brands.co',
    sellerName: 'TechFlow Gadgets',
    title: 'TechFlow SmartWatch Pro — Honest In-Depth Review',
    description: 'We\'re launching our SmartWatch Pro and want credible tech creators to deliver genuine, in-depth reviews. Creator must have demonstrated technical knowledge and an engaged tech-focused audience. Fake follower accounts will be filtered by Collabify.',
    minBudget: 12000,
    maxBudget: 35000,
    category: 'Tech',
    promotionType: 'POSTS',
    goal: 'SALES',
    minFollowers: 25000,
    maxFollowers: 150000,
  },
  {
    sellerEmail: 'brand.homespice@demo-brands.co',
    sellerName: 'HomeSpice Kitchen',
    title: 'HomeSpice Masala Launch — Regional Food Creator Campaign',
    description: 'HomeSpice is launching a regional spice blend collection. We need food creators who specialize in authentic Indian regional cuisines to integrate our spice blends into genuinely useful recipe content. Audience authenticity is critical.',
    minBudget: 6000,
    maxBudget: 18000,
    category: 'Food',
    promotionType: 'REELS',
    goal: 'REACH',
    minFollowers: 40000,
    maxFollowers: 250000,
  },
];

async function main() {
  console.log('Starting demo seed...\n');
  const hashedPw = await bcrypt.hash(DEMO_PASSWORD, 12);

  // --- Create creators ---
  let createdCreators = 0;
  let skippedCreators = 0;

  for (const c of creators) {
    const existing = await prisma.user.findUnique({ where: { email: c.email } });
    if (existing) {
      console.log(`  [SKIP] Creator already exists: ${c.email}`);
      skippedCreators++;
      continue;
    }

    try {
      const user = await prisma.user.create({
        data: {
          email: c.email,
          name: c.name,
          password: hashedPw,
          authProvider: 'LOCAL',
          emailVerified: true,
          isActive: true,
          activeRole: 'CREATOR',
          roles: {
            create: [{ type: 'CREATOR', password: hashedPw }]
          },
          creatorProfile: {
            create: {
              instagramUsername: c.insta,
              instagramProfileUrl: `https://instagram.com/${c.insta}`,
              followerCount: c.followers,
              selfReportedFollowers: c.followers,
              engagementRate: c.engagement,
              category: c.category,
              promotionTypes: ['REELS', 'POSTS'],
              minPrice: 5000,
              maxPrice: 50000,
              bio: c.bio,
              aiScore: c.aiScore,
              riskLevel: c.riskLevel,
              compositeRiskScore: c.compositeRisk,
              verificationStatus: c.riskLevel === 'high' ? 'mismatch_flagged' : 'verified',
              followerRiskScore: c.riskLevel,
              engagementQuality: c.aiScore > 80 ? 'High' : c.aiScore > 65 ? 'Medium' : 'Low',
              audienceAuthenticity: c.riskLevel === 'low' ? 'High' : c.riskLevel === 'medium' ? 'Medium' : 'Low',
              profileCompletionPercentage: 90,
              onboardingCompleted: true,
              availabilityStatus: 'AVAILABLE_NOW',
              profileSummary: c.bio,
            }
          }
        }
      });
      console.log(`  [OK] Created creator: ${c.name} (${c.email}) — AI Score: ${c.aiScore}, Risk: ${c.riskLevel}`);
      createdCreators++;
    } catch (err) {
      console.error(`  [ERR] Failed to create creator ${c.email}: ${err.message}`);
    }
  }

  // --- Create brand sellers and campaigns ---
  let createdCampaigns = 0;
  let skippedCampaigns = 0;

  for (const camp of campaigns) {
    let seller = await prisma.user.findUnique({ where: { email: camp.sellerEmail } });

    if (!seller) {
      try {
        seller = await prisma.user.create({
          data: {
            email: camp.sellerEmail,
            name: camp.sellerName,
            password: hashedPw,
            authProvider: 'LOCAL',
            emailVerified: true,
            isActive: true,
            activeRole: 'SELLER',
            roles: {
              create: [{ type: 'SELLER', password: hashedPw }]
            }
          }
        });
        console.log(`  [OK] Created brand account: ${camp.sellerName} (${camp.sellerEmail})`);
      } catch (err) {
        console.error(`  [ERR] Failed to create seller ${camp.sellerEmail}: ${err.message}`);
        skippedCampaigns++;
        continue;
      }
    }

    const existingCampaign = await prisma.promotionRequest.findFirst({
      where: { sellerId: seller.id, title: camp.title }
    });
    if (existingCampaign) {
      console.log(`  [SKIP] Campaign already exists: "${camp.title}"`);
      skippedCampaigns++;
      continue;
    }

    try {
      await prisma.promotionRequest.create({
        data: {
          sellerId: seller.id,
          title: camp.title,
          description: camp.description,
          minBudget: camp.minBudget,
          maxBudget: camp.maxBudget,
          promotionType: camp.promotionType,
          targetCategory: camp.category,
          minFollowers: camp.minFollowers,
          maxFollowers: camp.maxFollowers,
          campaignGoal: camp.goal,
          status: 'OPEN',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        }
      });
      console.log(`  [OK] Created campaign: "${camp.title}"`);
      createdCampaigns++;
    } catch (err) {
      console.error(`  [ERR] Failed to create campaign "${camp.title}": ${err.message}`);
    }
  }

  console.log('\n--- Seed Summary ---');
  console.log(`Creators: ${createdCreators} created, ${skippedCreators} skipped`);
  console.log(`Campaigns: ${createdCampaigns} created, ${skippedCampaigns} skipped`);
  console.log(`\nDemo login password for all accounts: ${DEMO_PASSWORD}`);
  console.log('Done.\n');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

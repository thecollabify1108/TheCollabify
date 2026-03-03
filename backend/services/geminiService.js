const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = require('../config/prisma');

// ═══════════════════════════════════════════════════════════════
// Gemini API Service — Centralised AI reasoning engine
// ═══════════════════════════════════════════════════════════════

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

// Initialise client from env — never hardcoded
const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

// In-memory per-user request tracker (supplementary to rate-limit middleware)
const userRequestCounts = new Map(); // userId -> { count, windowStart }
const USER_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const USER_MAX_REQUESTS = 60;          // 60 AI calls per user per hour

/**
 * System-level identity guardrail — prepended to every prompt
 */
const SYSTEM_IDENTITY = `You are a senior collaboration strategist and performance analyst with 10+ years of experience in creator marketing and campaign optimization. Your responses must be analytical, structured, and professional. Avoid hype, emojis, and filler. Every recommendation should be backed by strategic reasoning.`;

// --- Helpers ---

/**
 * Enforce per-user rate limit. Throws if exceeded.
 */
function enforceUserRateLimit(userId) {
    const now = Date.now();
    let entry = userRequestCounts.get(userId);
    if (!entry || now - entry.windowStart > USER_WINDOW_MS) {
        entry = { count: 0, windowStart: now };
    }
    entry.count++;
    userRequestCounts.set(userId, entry);

    if (entry.count > USER_MAX_REQUESTS) {
        const err = new Error('AI rate limit exceeded — try again later');
        err.status = 429;
        throw err;
    }
}

/**
 * Log an AI usage event to the database (fire-and-forget)
 */
async function logUsage({ userId, mode, model, promptTokens, completionTokens, latencyMs, success, errorMessage }) {
    try {
        await prisma.aIUsageLog.create({
            data: {
                userId,
                mode,
                model: model || GEMINI_MODEL,
                promptTokens: promptTokens || 0,
                completionTokens: completionTokens || 0,
                totalTokens: (promptTokens || 0) + (completionTokens || 0),
                latencyMs: latencyMs || 0,
                success: success !== false,
                errorMessage: errorMessage || null,
            },
        });
    } catch (err) {
        console.error('[GeminiService] Failed to log usage:', err.message);
    }
}

// --- Database Fetchers ---

/**
 * Fetch a structured creator profile from the database
 */
async function fetchCreatorData(creatorId) {
    const creator = await prisma.creatorProfile.findUnique({
        where: { id: creatorId },
        include: {
            user: { select: { name: true, email: true, avatar: true } },
            qualityIndex: true,
        },
    });
    if (!creator) return null;

    return {
        id: creator.id,
        name: creator.user?.name || 'Unknown',
        niche: creator.category,
        followers: creator.followerCount,
        engagementRate: creator.engagementRate,
        bio: creator.bio || '',
        platform: creator.instagramUsername ? 'Instagram' : 'Unknown',
        minPrice: creator.minPrice,
        maxPrice: creator.maxPrice,
        promotionTypes: creator.promotionTypes,
        location: creator.location,
        availabilityStatus: creator.availabilityStatus,
        profileCompletion: creator.profileCompletionPercentage,
        totalPromotions: creator.totalPromotions,
        successfulPromotions: creator.successfulPromotions,
        averageRating: creator.averageRating,
        reliabilityScore: creator.reliabilityScore || 1.0,
        verificationStatus: creator.verificationStatus,
        compositeRiskScore: creator.compositeRiskScore,
        riskLevel: creator.riskLevel,
        // CQI sub-scores
        cqi: creator.qualityIndex ? {
            overallScore: creator.qualityIndex.overallScore,
            engagementConsistency: creator.qualityIndex.engagementConsistency,
            followerGrowthStability: creator.qualityIndex.followerGrowthStability,
            postingFrequency: creator.qualityIndex.postingFrequency,
            audienceQuality: creator.qualityIndex.audienceQuality,
        } : null,
        strengths: creator.strengths || [],
        engagementQuality: creator.engagementQuality,
        audienceAuthenticity: creator.audienceAuthenticity,
    };
}

/**
 * Fetch a structured campaign/brand request from the database
 */
async function fetchCampaignData(campaignId) {
    const campaign = await prisma.promotionRequest.findUnique({
        where: { id: campaignId },
        include: {
            seller: { select: { name: true, email: true } },
        },
    });
    if (!campaign) return null;

    return {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        brandName: campaign.seller?.name || 'Unknown Brand',
        category: campaign.targetCategory,
        promotionType: campaign.promotionType,
        minBudget: campaign.minBudget,
        maxBudget: campaign.maxBudget,
        minFollowers: campaign.minFollowers,
        maxFollowers: campaign.maxFollowers,
        campaignGoal: campaign.campaignGoal,
        location: campaign.location,
        locationType: campaign.locationType,
        status: campaign.status,
        deadline: campaign.deadline,
    };
}

// --- Core Gemini Call ---

/**
 * Call Gemini with a structured prompt. Enforces rate limits, logs usage.
 *
 * @param {Object} opts
 * @param {string} opts.userId     - Requesting user's ID
 * @param {string} opts.mode       - Label for logging (e.g. 'match-intelligence')
 * @param {string} opts.prompt     - Full prompt text
 * @param {Object} [opts.fallback] - Returned when Gemini is unavailable
 * @param {function} [opts.parser] - (text) => parsed result; if omitted, returns raw text
 * @returns {Promise<Object>}
 */
async function callGemini({ userId, mode, prompt, fallback, parser }) {
    // 1. Rate-limit guard
    enforceUserRateLimit(userId);

    // 2. Check client availability
    if (!genAI) {
        console.warn(`[GeminiService] GEMINI_API_KEY missing — returning fallback for ${mode}`);
        await logUsage({ userId, mode, success: false, errorMessage: 'API key not configured' });
        return fallback || { error: 'Gemini API not configured' };
    }

    const start = Date.now();
    try {
        const model = genAI.getGenerativeModel({
            model: GEMINI_MODEL,
            generationConfig: {
                temperature: 0.5,   // Low temperature for structured, analytical outputs
                topP: 0.85,
                maxOutputTokens: 2048,
            },
        });
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text().trim();
        const latencyMs = Date.now() - start;

        // Extract token counts if available
        const usage = response.usageMetadata || {};
        const promptTokens = usage.promptTokenCount || 0;
        const completionTokens = usage.candidatesTokenCount || 0;

        // Log success
        await logUsage({ userId, mode, promptTokens, completionTokens, latencyMs, success: true });

        // Parse if parser provided
        if (parser) {
            try {
                return parser(text);
            } catch (parseErr) {
                console.warn(`[GeminiService] Parse error for ${mode}:`, parseErr.message);
                return fallback || { rawText: text };
            }
        }
        return { text };

    } catch (err) {
        const latencyMs = Date.now() - start;
        console.error(`[GeminiService] Gemini call failed (${mode}):`, err.message);
        await logUsage({ userId, mode, latencyMs, success: false, errorMessage: err.message });

        // If it's a Gemini quota / safety error, propagate status
        if (err.status === 429 || err.message?.includes('quota')) {
            const quotaErr = new Error('Gemini API quota exceeded — try again later');
            quotaErr.status = 429;
            throw quotaErr;
        }
        return fallback || { error: 'AI service temporarily unavailable' };
    }
}

// --- Prompt Builders ---

/**
 * Build a Match Intelligence prompt from DB-fetched data
 */
function buildMatchIntelligencePrompt(creator, campaign) {
    return `${SYSTEM_IDENTITY}

TASK: Perform a Match Intelligence analysis for a creator-campaign pairing.

CREATOR PROFILE (from database):
- Name: ${creator.name}
- Niche: ${creator.niche}
- Followers: ${creator.followers?.toLocaleString() || 'N/A'}
- Engagement Rate: ${creator.engagementRate || 'N/A'}%
- Platform: ${creator.platform || 'Instagram'}
- Price Range: $${creator.minPrice} - $${creator.maxPrice}
- Promotion Types: ${creator.promotionTypes?.join(', ') || 'N/A'}
- Reliability Score: ${creator.reliabilityScore}/5
- Verification Status: ${creator.verificationStatus}
- Risk Score: ${creator.compositeRiskScore}/100 (${creator.riskLevel})
- Profile Completion: ${creator.profileCompletion}%
- Past Promotions: ${creator.totalPromotions} total, ${creator.successfulPromotions} successful
- Bio: ${creator.bio?.substring(0, 200) || 'Not provided'}

CAMPAIGN PROFILE (from database):
- Title: ${campaign.title}
- Brand: ${campaign.brandName}
- Category: ${campaign.category}
- Goal: ${campaign.campaignGoal}
- Budget: $${campaign.minBudget} - $${campaign.maxBudget}
- Promotion Type: ${campaign.promotionType}
- Target Followers: ${campaign.minFollowers?.toLocaleString() || '0'} - ${campaign.maxFollowers?.toLocaleString() || 'unlimited'}
- Location: ${campaign.locationType || 'REMOTE'}

RESPOND IN VALID JSON ONLY. No markdown, no code fences, no extra text.
{
  "matchFitScore": <0-100 integer>,
  "audienceAlignmentSummary": "<2-3 sentences>",
  "engagementReliabilityAssessment": "<2-3 sentences>",
  "riskFactors": ["<risk 1>", "<risk 2>", "<risk 3>"],
  "suggestedCampaignAngle": "<2-3 sentences>",
  "confidenceLevel": "<Low|Medium|High> (<percentage>%) - <brief justification>"
}`;
}

/**
 * Build a Creator Audit prompt from DB-fetched data
 */
function buildCreatorAuditPrompt(creator) {
    return `${SYSTEM_IDENTITY}

TASK: Perform a comprehensive Creator Audit based on real profile data.

CREATOR PROFILE (from database):
- Name: ${creator.name}
- Niche: ${creator.niche}
- Followers: ${creator.followers?.toLocaleString() || 'N/A'}
- Engagement Rate: ${creator.engagementRate || 'N/A'}%
- Platform: ${creator.platform || 'Instagram'}
- Reliability Score: ${creator.reliabilityScore}/5
- Verification Status: ${creator.verificationStatus}
- Composite Risk Score: ${creator.compositeRiskScore}/100 (${creator.riskLevel})
- Engagement Quality: ${creator.engagementQuality || 'N/A'}
- Audience Authenticity: ${creator.audienceAuthenticity || 'N/A'}
- Profile Completion: ${creator.profileCompletion}%
- Total Promotions: ${creator.totalPromotions}
- Successful Promotions: ${creator.successfulPromotions}
- Average Rating: ${creator.averageRating}
- Strengths: ${creator.strengths?.join(', ') || 'Not analyzed'}
- Bio: ${creator.bio?.substring(0, 200) || 'Not provided'}
${creator.cqi ? `
CQI SCORES:
- Overall: ${creator.cqi.overallScore}/100
- Engagement Consistency: ${creator.cqi.engagementConsistency}/100
- Follower Growth Stability: ${creator.cqi.followerGrowthStability}/100
- Posting Frequency: ${creator.cqi.postingFrequency}/100
- Audience Quality: ${creator.cqi.audienceQuality}/100` : '- CQI: Not yet computed'}

RESPOND IN VALID JSON ONLY. No markdown, no code fences, no extra text.
{
  "engagementConsistencyAnalysis": "<2-3 sentences>",
  "growthStabilityOverview": "<2-3 sentences>",
  "authenticityIndicators": ["<indicator 1>", "<indicator 2>", "<indicator 3>"],
  "nicheAuthorityLevel": "<2 sentences>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvementAreas": ["<area 1>", "<area 2>", "<area 3>"],
  "riskIndex": "<score>/100 (<Low|Medium|High>) - <brief justification>"
}`;
}

/**
 * Build a Campaign Strategy prompt from DB-fetched data
 */
function buildCampaignStrategyPrompt(campaign) {
    return `${SYSTEM_IDENTITY}

TASK: Develop a comprehensive Campaign Strategy.

CAMPAIGN DETAILS (from database):
- Title: ${campaign.title}
- Brand: ${campaign.brandName}
- Category: ${campaign.category}
- Goal: ${campaign.campaignGoal}
- Budget: $${campaign.minBudget} - $${campaign.maxBudget}
- Promotion Type: ${campaign.promotionType}
- Target Followers: ${campaign.minFollowers?.toLocaleString() || '0'} - ${campaign.maxFollowers?.toLocaleString() || 'unlimited'}
- Location Type: ${campaign.locationType || 'REMOTE'}
- Deadline: ${campaign.deadline ? new Date(campaign.deadline).toLocaleDateString() : 'Not set'}
- Description: ${campaign.description?.substring(0, 300) || 'Not provided'}

RESPOND IN VALID JSON ONLY. No markdown, no code fences, no extra text.
{
  "campaignObjectiveClarification": "<2-3 sentences>",
  "recommendedContentFormatMix": ["<format 1 with % and rationale>", "<format 2>", "<format 3>", "<format 4>"],
  "postingFrequencyRecommendation": "<specific cadence with timing>",
  "kpiBenchmarks": ["<KPI 1 with target>", "<KPI 2>", "<KPI 3>", "<KPI 4>"],
  "budgetAllocationLogic": "<2-3 sentences with % breakdown>",
  "riskAwareness": ["<risk 1 with mitigation>", "<risk 2>", "<risk 3>"]
}`;
}

/**
 * Build an ROI Forecast prompt from DB-fetched data
 */
function buildROIForecastPrompt(creator, campaign) {
    return `${SYSTEM_IDENTITY}

TASK: Generate an ROI & Performance Forecast for a creator-campaign pairing.

CREATOR PROFILE (from database):
- Name: ${creator.name}
- Niche: ${creator.niche}
- Followers: ${creator.followers?.toLocaleString() || 'N/A'}
- Engagement Rate: ${creator.engagementRate || 'N/A'}%
- Reliability Score: ${creator.reliabilityScore}/5
- Past Promotions: ${creator.totalPromotions} total, ${creator.successfulPromotions} successful
- Average Rating: ${creator.averageRating}
- Risk Score: ${creator.compositeRiskScore}/100 (${creator.riskLevel})

CAMPAIGN PARAMETERS (from database):
- Title: ${campaign.title}
- Category: ${campaign.category}
- Budget: $${campaign.minBudget} - $${campaign.maxBudget}
- Goal: ${campaign.campaignGoal}
- Promotion Type: ${campaign.promotionType}

RESPOND IN VALID JSON ONLY. No markdown, no code fences, no extra text.
{
  "estimatedEngagementRange": "<specific numeric ranges for rate, impressions, interactions>",
  "projectedROIBand": "<conservative, moderate, optimistic scenarios with multipliers>",
  "riskProbability": ["<risk 1 with % probability>", "<risk 2>", "<risk 3>"],
  "suggestedCreatorTier": "<tier recommendation with justification>",
  "confidenceInterval": "<High|Medium|Low> (<percentage>%) - <what would increase confidence>"
}`;
}

/**
 * Build an Optimization prompt from DB-fetched data
 */
function buildOptimizationPrompt(campaign, performanceData) {
    return `${SYSTEM_IDENTITY}

TASK: Perform a campaign Optimization analysis.

CAMPAIGN (from database):
- Title: ${campaign.title}
- Category: ${campaign.category}
- Goal: ${campaign.campaignGoal}
- Budget: $${campaign.minBudget} - $${campaign.maxBudget}
- Promotion Type: ${campaign.promotionType}

PERFORMANCE DATA (user-supplied):
- Engagement Rate: ${performanceData.engagementRate || 'Not specified'}%
- Reach: ${performanceData.reach || 'Not specified'}
- Conversions: ${performanceData.conversions || 'Not specified'}
- Content Types Used: ${performanceData.contentTypes || 'Not specified'}

RESPOND IN VALID JSON ONLY. No markdown, no code fences, no extra text.
{
  "performanceGapAnalysis": "<2-3 sentences comparing actual vs benchmarks>",
  "whatWorked": ["<success 1 with reasoning>", "<success 2>", "<success 3>"],
  "whatUnderperformed": ["<weakness 1 with evidence>", "<weakness 2>", "<weakness 3>"],
  "recommendedAdjustments": ["<adjustment 1 with expected impact>", "<adjustment 2>", "<adjustment 3>", "<adjustment 4>"],
  "strategicNextStep": "<2-3 sentences on the single most impactful next action>"
}`;
}

// --- Structured JSON Parser ---

/**
 * Parse Gemini response text as JSON, stripping code fences if present
 */
function parseJSON(text) {
    // Strip markdown code fences
    let cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    return JSON.parse(cleaned);
}

// --- Public API ---

module.exports = {
    // Core
    callGemini,
    parseJSON,
    SYSTEM_IDENTITY,
    GEMINI_MODEL,

    // Data fetchers
    fetchCreatorData,
    fetchCampaignData,

    // Prompt builders
    buildMatchIntelligencePrompt,
    buildCreatorAuditPrompt,
    buildCampaignStrategyPrompt,
    buildROIForecastPrompt,
    buildOptimizationPrompt,

    // Usage
    logUsage,
    enforceUserRateLimit,
};

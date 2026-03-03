const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini client
const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

// Shared generation config — low temperature for structured analytical output
const GENERATION_CONFIG = {
    temperature: 0.5,
    topP: 0.85,
    maxOutputTokens: 2048,
};

/**
 * Collabify Intelligence Engine
 * 
 * Structured content intelligence for generating strategic briefs,
 * discovery tags, and performance-driven recommendations.
 */
class AIContentService {

    // System-level identity guardrail applied to all prompts
    static SYSTEM_IDENTITY = `You are a senior collaboration strategist and performance analyst with 10+ years of experience in creator marketing and campaign optimization. Your responses must be analytical, structured, and professional. Avoid hype, emojis, and filler. Every recommendation should be backed by strategic reasoning.`;

    /**
     * Generate a structured content brief
     */
    static async generateCaption(topic, platform, tone) {
        if (!genAI) {
            console.warn('GEMINI_API_KEY missing - falling back to mock brief');
            return `Content brief for ${topic} on ${platform}: Lead with a clear value proposition. Address the target audience directly. Include a specific call-to-action aligned with campaign objectives.`;
        }

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: GENERATION_CONFIG });

            const platformGuidelines = {
                Instagram: 'Instagram: Up to 2,200 characters. Front-load the hook in the first 125 characters (visible before truncation). Use line breaks for scannability. Hashtags in first comment or end of caption.',
                YouTube: 'YouTube: Front-load keywords in first 2 lines for SEO. Include a clear value proposition. Add timestamps for longer content. Optimize for search intent.',
                TikTok: 'TikTok: Under 150 characters. Concise and direct. Reference trending formats where relevant. Prioritize relatability and immediate hook.',
                Twitter: 'Twitter/X: Under 280 characters. Lead with insight or contrarian take. Maximum 2 hashtags. Prioritize shareability and reply-worthiness.',
                LinkedIn: 'LinkedIn: Thought-leadership positioning. Open with data, insight, or bold claim. Line breaks every 1-2 sentences. Professional but conversational.'
            };

            const toneGuidelines = {
                casual: 'Conversational and approachable. Use natural language patterns. Maintain warmth without sacrificing substance.',
                professional: 'Authoritative and credible. Use precise language, data references where appropriate, and industry-specific terminology.',
                storytelling: 'Narrative structure: hook, context, insight, resolution. First-person perspective. Focus on authentic experience and transformation.',
                promotional: 'Benefit-led positioning. Lead with transformation, not features. Include social proof framing and a specific call-to-action. Avoid sounding salesy.'
            };

            const prompt = `${this.SYSTEM_IDENTITY}

TASK: Write ONE strategic ${platform} content brief.

TOPIC: ${topic}
PLATFORM: ${platform}
TONE: ${tone}

PLATFORM GUIDELINES:
${platformGuidelines[platform] || platformGuidelines.Instagram}

TONE DIRECTION:
${toneGuidelines[tone] || toneGuidelines.professional}

STRUCTURAL REQUIREMENTS:
- Open with a compelling hook that creates immediate interest
- Deliver a clear value proposition within the first two sentences
- Use no more than 2 emojis (only if contextually appropriate for the platform)
- End with a specific, measurable call-to-action
- Vary sentence length for readability
- Avoid generic phrases, filler words, and hype language
- Every sentence should serve a strategic purpose

FORMAT: Return ONLY the content text, ready to use. No labels, quotes, or meta-commentary.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error) {
            console.error('Gemini caption error:', error.message);
            return `Strategic brief for ${topic}: Position your content around a specific audience need. Lead with value, not product. Close with a clear next step for the viewer.`;
        }
    }

    /**
     * Generate hashtags based on topic and niche
     */
    static async generateHashtags(topic, niche) {
        if (!genAI) {
            return [`#${topic.replace(/\s+/g, '')}`, `#${niche}`, '#CreatorEconomy', '#BrandCollab', '#ContentStrategy'];
        }

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: GENERATION_CONFIG });
            const prompt = `${this.SYSTEM_IDENTITY}

TASK: Generate a strategically curated set of 15 discovery tags (hashtags).

TOPIC: ${topic}
NICHE: ${niche}

DISTRIBUTION STRATEGY:
- 3 high-volume tags (1M+ posts) for broad discovery
- 5 medium-volume tags (100K-1M posts) for competitive ranking
- 4 niche-specific tags (10K-100K posts) for targeted community reach
- 3 branded or unique tags for audience ownership

CONSTRAINTS:
- Every tag must be directly relevant to "${topic}" within the "${niche}" vertical
- No generic spam tags (e.g., #FYP, #ForYou, #Viral, #Trending)
- Prioritize tags that the target audience actively searches
- All lowercase, no spaces within tags

FORMAT: Return ONLY a space-separated string of 15 hashtags. No commentary.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().trim();
            const tags = text.split(/\s+/);
            return tags.filter(t => t.startsWith('#')).slice(0, 15);
        } catch (error) {
            console.error('Gemini hashtag error:', error.message);
            return [`#${topic.replace(/\s+/g, '')}`, `#${niche}`];
        }
    }

    /**
     * Generate strategic content recommendations
     */
    static async generateContentIdeas(category, platform) {
        const categoryIdeas = {
            Fashion: [
                `GRWM reel featuring a styled look progression from casual to event-ready — this format drives 2.3x higher completion rates`,
                `Outfit of the Week carousel with 7 distinct looks — carousel format generates 3x more saves than single images`,
                `Behind-the-scenes of a styling session or photoshoot — process content builds creator credibility and audience trust`,
                `"This or That" style comparison poll — interactive formats increase story engagement by 40%`
            ],
            Tech: [
                `Unboxing and first impressions review with structured pros/cons — honest reaction format builds purchase trust`,
                `"5 Settings You Are Not Using" tutorial reel — utility content gets saved and shared at 4x the rate of promotional posts`,
                `Day-in-my-life using a single product — real-world usage context outperforms spec-based reviews`,
                `Myth vs Reality comparison on common product misconceptions — contrarian takes drive comment engagement`
            ],
            Fitness: [
                `30-day challenge documentation with daily progress clips — challenge formats drive consistent follower return visits`,
                `"Form Check" educational reel correcting common exercise mistakes — educational fitness content has 67% higher save rate`,
                `Full day of eating paired with workout split breakdown — complete routine content has highest bookmark rate in fitness`,
                `Progress comparison: Week 1 vs Week 4 with measurable metrics — transformation content drives organic discovery`
            ],
            Food: [
                `60-second recipe reel opening with the finished dish — leading with outcome increases watch-through by 45%`,
                `"Restaurant vs Homemade" side-by-side comparison — comparison format drives comment debate and shares`,
                `Kitchen technique hack with before/after results — utility content consistently outperforms aesthetic food posts`,
                `Local restaurant review with genuine first-bite reactions — authentic reaction content builds audience trust`
            ],
            Beauty: [
                `Before and after transformation showing product application in real time — process content outperforms static results`,
                `"Dupe or Worth It" price-performance comparison with structured verdict — comparison content drives saves`,
                `5-minute everyday look tutorial — achievable tutorials have 3x higher completion rate than aspirational content`,
                `Skincare routine with application order rationale — educational beauty content has the highest save-to-impression ratio`
            ],
            Travel: [
                `"What I Wish I Knew Before Visiting" carousel — practical travel tips have the highest save rate in the vertical`,
                `Hidden local spots with specific directions — unique location content outperforms standard tourist photography`,
                `Daily budget breakdown with exact costs per category — financial transparency content drives high engagement`,
                `Pack with me showing essentials with reasoning — practical preparation content generates consistent saves`
            ],
            Lifestyle: [
                `Realistic morning routine without idealization — authentic routine content builds stronger audience connection`,
                `Room or desk transformation with before/after — makeover content has high shareability and save metrics`,
                `Tool and app recommendations with specific use cases — actionable recommendation content generates sustained engagement`,
                `"One change that made a measurable difference" narrative post — personal insight content drives meaningful comments`
            ],
            Gaming: [
                `Top 5 advanced tips that beginners overlook — structured tip content gets bookmarked and referenced repeatedly`,
                `Highlight compilation with strategic audio selection — montage content performs well for discovery and new followers`,
                `Community challenge or follower collaboration — participatory content builds retention and repeat engagement`,
                `Settings and setup walkthrough with performance benchmarks — optimization content attracts dedicated community members`
            ],
            Education: [
                `Complex topic explained in under 60 seconds with visual aids — concise explainers have the highest share rate`,
                `Common mistakes analysis with structured corrections — error-correction content gets saved for future reference`,
                `Evidence-based technique breakdown with cited research — credibility-driven content builds authority positioning`,
                `Community Q&A addressing the most frequently asked question in your field — responsive content strengthens audience loyalty`
            ],
            Business: [
                `First client/sale acquisition story with specific tactics used — founder stories with actionable detail perform best`,
                `Single business lesson learned through experience with measurable outcome — specific advice outperforms general tips`,
                `Behind-the-scenes of daily operations — operational transparency humanizes the brand and builds trust`,
                `Productivity tool or strategy review with quantified results — ROI-focused content drives saves and forwards`
            ]
        };

        const defaultIdeas = [
            `Behind-the-scenes process content — showing the work, not just the result, builds audience trust and engagement`,
            `Q&A session addressing top audience questions — responsive content strengthens community loyalty`,
            `Before and after transformation with measurable context — visual impact drives organic shares and discovery`,
            `"Top 5" educational carousel — structured educational content has the highest save-to-impression ratio`
        ];

        if (!genAI) {
            return categoryIdeas[category] || defaultIdeas;
        }

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: GENERATION_CONFIG });
            const prompt = `${this.SYSTEM_IDENTITY}

TASK: Generate exactly 4 strategic content recommendations for a ${category} creator on ${platform}.

REQUIREMENTS FOR EACH RECOMMENDATION:
- Be specific and immediately actionable (not generic like "post about your niche")
- Specify the content FORMAT (reel, carousel, story, static post, live, etc.)
- Include a brief strategic rationale (e.g., "carousel format generates 3x more saves" or "this structure has high completion rates")
- Each idea should cover a different content pillar: educational, engagement-driven, community-building, or conversion-focused
- Keep each recommendation under 35 words
- Do not use emojis
- Do not use hype language or filler

FORMAT: Return ONLY the 4 recommendations, one per line. No numbering, no bullet points, no additional commentary.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const ideas = response.text().split('\n').filter(line => line.trim().length > 10).slice(0, 4);
            return ideas.length >= 2 ? ideas : (categoryIdeas[category] || defaultIdeas);
        } catch (error) {
            console.error('Gemini ideas error:', error.message);
            return categoryIdeas[category] || defaultIdeas;
        }
    }

    /**
     * Generate optimal posting schedule
     */
    static async generatePostingSchedule(category) {
        const schedules = {
            default: [
                { day: 'Monday', time: '12:00 PM', type: 'Educational carousel' },
                { day: 'Tuesday', time: '6:00 PM', type: 'Behind-the-scenes story' },
                { day: 'Wednesday', time: '9:00 AM', type: 'Engagement post (poll/question)' },
                { day: 'Thursday', time: '7:00 PM', type: 'Trending reel/video' },
                { day: 'Friday', time: '5:00 PM', type: 'User-generated or collab content' },
                { day: 'Saturday', time: '11:00 AM', type: 'Lifestyle/personal content' },
                { day: 'Sunday', time: '10:00 AM', type: 'Weekly recap or planning' }
            ],
            Fashion: [
                { day: 'Monday', time: '11:00 AM', type: 'OOTD (Outfit of the Day)' },
                { day: 'Tuesday', time: '7:00 PM', type: 'Styling tips reel' },
                { day: 'Wednesday', time: '12:00 PM', type: 'Trend alert carousel' },
                { day: 'Thursday', time: '6:00 PM', type: 'Try-on haul' },
                { day: 'Friday', time: '5:00 PM', type: 'Weekend outfit inspo' },
                { day: 'Saturday', time: '10:00 AM', type: 'Shopping guide/finds' },
                { day: 'Sunday', time: '4:00 PM', type: 'Week ahead planning' }
            ],
            Tech: [
                { day: 'Monday', time: '9:00 AM', type: 'Product tip or hack' },
                { day: 'Tuesday', time: '12:00 PM', type: 'Tutorial/how-to' },
                { day: 'Wednesday', time: '6:00 PM', type: 'News or update commentary' },
                { day: 'Thursday', time: '7:00 PM', type: 'Review or comparison' },
                { day: 'Friday', time: '3:00 PM', type: 'Setup tour or desk tour' },
                { day: 'Saturday', time: '11:00 AM', type: 'Community Q&A' },
                { day: 'Sunday', time: '5:00 PM', type: 'Weekly tech roundup' }
            ],
            Fitness: [
                { day: 'Monday', time: '6:00 AM', type: 'Workout routine reel' },
                { day: 'Tuesday', time: '12:00 PM', type: 'Meal prep content' },
                { day: 'Wednesday', time: '7:00 AM', type: 'Form tutorial' },
                { day: 'Thursday', time: '5:00 PM', type: 'Progress update' },
                { day: 'Friday', time: '6:00 AM', type: 'Full workout video' },
                { day: 'Saturday', time: '9:00 AM', type: 'Active recovery tips' },
                { day: 'Sunday', time: '10:00 AM', type: 'Week planning & goals' }
            ],
            Food: [
                { day: 'Monday', time: '11:00 AM', type: 'Quick recipe reel' },
                { day: 'Tuesday', time: '6:00 PM', type: 'Restaurant review' },
                { day: 'Wednesday', time: '12:00 PM', type: 'Kitchen hack/tip' },
                { day: 'Thursday', time: '7:00 PM', type: 'Full recipe tutorial' },
                { day: 'Friday', time: '5:00 PM', type: 'Weekend dinner inspo' },
                { day: 'Saturday', time: '10:00 AM', type: 'Brunch or baking content' },
                { day: 'Sunday', time: '4:00 PM', type: 'Meal plan for the week' }
            ]
        };

        return schedules[category] || schedules.default;
    }

    /**
     * Get market insights for sellers based on current trends
     */
    static async getMarketInsights(campaignData) {
        // Keeping this as a simulated rule-based return for stability, 
        // as trending data usually comes from specialized scrapers/APIs
        return [
            {
                id: 'timing',
                type: 'timing',
                title: 'Optimal Launch Timing',
                description: 'Current platform data suggests launching between 6-9 PM gets 40% more engagement.',
                action: 'Optimize launch time',
                impact: 'high',
                confidence: 89
            },
            {
                id: 'category',
                type: 'category',
                title: 'Niche Performance Signal: Micro-Influencers',
                description: 'Micro-influencers in the Tech/Lifestyle space are currently seeing 2x ROI compared to macro creators.',
                action: 'Shift target niche',
                impact: 'high',
                confidence: 91
            },
            {
                id: 'promotion',
                type: 'promotion',
                title: 'Format Performance Analysis: Reels',
                description: 'Reels campaigns are currently seeing 3x higher retention than static posts.',
                action: 'Switch to Reels',
                impact: 'high',
                confidence: 94
            }
        ];
    }

    // ═══════════════════════════════════════════════════════════
    // INTELLIGENCE MODES
    // ═══════════════════════════════════════════════════════════

    /**
     * Mode 1: Match Intelligence
     * Evaluates creator-campaign fit with structured scoring
     */
    static async runMatchIntelligence({ creatorNiche, creatorFollowers, creatorEngagement, campaignCategory, campaignBudget, platform }) {
        const fallback = {
            matchFitScore: 72,
            audienceAlignmentSummary: `The creator's ${creatorNiche || 'general'} niche shows moderate overlap with the ${campaignCategory || 'target'} campaign vertical. Audience demographics suggest partial alignment — strongest in the 18-34 age bracket.`,
            engagementReliabilityAssessment: `Engagement rate of ${creatorEngagement || 'N/A'}% falls within acceptable range. Consistency across recent posts should be verified before commitment.`,
            riskFactors: [
                'Audience overlap with campaign target has not been independently verified',
                'Engagement consistency may fluctuate based on content type variance',
                'Brand safety screening has not been completed for recent content history'
            ],
            suggestedCampaignAngle: `Position around authentic ${creatorNiche || 'lifestyle'} integration with product-in-use format. Avoid overt promotional framing — native content resonance will outperform scripted placements.`,
            confidenceLevel: 'Medium (72%) — requires additional data points for high-confidence assessment'
        };

        if (!genAI) return fallback;

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: GENERATION_CONFIG });
            const prompt = `${this.SYSTEM_IDENTITY}

TASK: Perform a Match Intelligence analysis for a creator-campaign pairing.

CREATOR PROFILE:
- Niche: ${creatorNiche || 'Not specified'}
- Followers: ${creatorFollowers || 'Not specified'}
- Engagement Rate: ${creatorEngagement || 'Not specified'}%
- Platform: ${platform || 'Instagram'}

CAMPAIGN PROFILE:
- Category: ${campaignCategory || 'Not specified'}
- Budget: ${campaignBudget || 'Not specified'}

OUTPUT STRUCTURE (use these exact headers, respond in plain text, no markdown):

MATCH FIT SCORE: [0-100 numeric score]

AUDIENCE ALIGNMENT SUMMARY: [2-3 sentences analyzing audience overlap between creator and campaign target]

ENGAGEMENT RELIABILITY ASSESSMENT: [2-3 sentences on engagement quality, consistency, and authenticity indicators]

RISK FACTORS:
- [Risk 1]
- [Risk 2]
- [Risk 3]

SUGGESTED CAMPAIGN ANGLE: [2-3 sentences recommending optimal content approach]

CONFIDENCE LEVEL: [Low/Medium/High with percentage and brief justification]

CONSTRAINTS: No emojis. No filler. No hype. Be analytical and direct.`;

            const result = await model.generateContent(prompt);
            const text = result.response.text().trim();
            return this._parseStructuredOutput(text, 'matchIntelligence', fallback);
        } catch (error) {
            console.error('Match Intelligence error:', error.message);
            return fallback;
        }
    }

    /**
     * Mode 2: Creator Audit
     * Comprehensive creator quality and reliability assessment
     */
    static async runCreatorAudit({ creatorNiche, creatorFollowers, creatorEngagement, platform, contentFrequency }) {
        const fallback = {
            engagementConsistencyAnalysis: `Current engagement rate of ${creatorEngagement || 'N/A'}% requires consistency validation across a 90-day window. Single-point metrics are insufficient for reliability assessment.`,
            growthStabilityOverview: `Follower count of ${creatorFollowers || 'N/A'} should be evaluated against monthly growth rate. Stable organic growth (2-5% monthly) indicates healthy audience building.`,
            authenticityIndicators: [
                'Comment-to-like ratio should exceed 2% for authentic engagement signals',
                'Follower growth spikes require manual review for potential inorganic activity',
                'Story view-to-follower ratio above 5% indicates genuine audience attention'
            ],
            nicheAuthorityLevel: `Moderate authority in ${creatorNiche || 'general'} vertical. Authority is strengthened by consistent topical posting and audience interaction patterns.`,
            strengths: [
                'Active content cadence demonstrates platform commitment',
                'Niche focus provides clear brand alignment opportunities',
                'Engagement rate is within competitive range for the follower tier'
            ],
            improvementAreas: [
                'Content diversification across formats could improve reach metrics',
                'Cross-platform presence would strengthen overall creator positioning',
                'Audience demographic data transparency needs improvement'
            ],
            riskIndex: 'Low-Medium (35/100) — no critical red flags, standard verification recommended'
        };

        if (!genAI) return fallback;

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: GENERATION_CONFIG });
            const prompt = `${this.SYSTEM_IDENTITY}

TASK: Perform a comprehensive Creator Audit.

CREATOR PROFILE:
- Niche: ${creatorNiche || 'Not specified'}
- Followers: ${creatorFollowers || 'Not specified'}
- Engagement Rate: ${creatorEngagement || 'Not specified'}%
- Platform: ${platform || 'Instagram'}
- Content Frequency: ${contentFrequency || 'Not specified'}

OUTPUT STRUCTURE (use these exact headers, respond in plain text, no markdown):

ENGAGEMENT CONSISTENCY ANALYSIS: [2-3 sentences on engagement patterns and reliability]

GROWTH STABILITY OVERVIEW: [2-3 sentences on follower growth trajectory and organic indicators]

AUTHENTICITY INDICATORS:
- [Indicator 1]
- [Indicator 2]
- [Indicator 3]

NICHE AUTHORITY LEVEL: [2 sentences on creator's positioning within their vertical]

STRENGTHS:
- [Strength 1]
- [Strength 2]
- [Strength 3]

IMPROVEMENT AREAS:
- [Area 1]
- [Area 2]
- [Area 3]

RISK INDEX: [Score out of 100 with Low/Medium/High label and brief justification]

CONSTRAINTS: No emojis. No filler. No hype. Be analytical and direct.`;

            const result = await model.generateContent(prompt);
            const text = result.response.text().trim();
            return this._parseStructuredOutput(text, 'creatorAudit', fallback);
        } catch (error) {
            console.error('Creator Audit error:', error.message);
            return fallback;
        }
    }

    /**
     * Mode 3: Campaign Strategy
     * Strategic campaign planning and execution framework
     */
    static async runCampaignStrategy({ campaignCategory, campaignBudget, campaignGoal, platform, duration }) {
        const fallback = {
            campaignObjectiveClarification: `Primary objective for this ${campaignCategory || 'general'} campaign should be awareness-to-consideration conversion. Budget of ${campaignBudget || 'N/A'} suggests a targeted micro-influencer approach over broad reach.`,
            recommendedContentFormatMix: [
                'Reels/Short-form video: 40% of content allocation — highest organic reach potential',
                'Carousel posts: 30% — strongest save and share mechanics for educational content',
                'Stories: 20% — real-time engagement and behind-the-scenes authenticity',
                'Static posts: 10% — brand anchoring and portfolio-quality visuals'
            ],
            postingFrequencyRecommendation: 'Feed: 4-5 posts per week. Stories: Daily. Reels: 3 per week minimum. Optimal posting windows: 11 AM-1 PM and 6-9 PM local time.',
            kpiBenchmarks: [
                'Engagement rate target: 3-5% for micro-influencer tier',
                'Reach-to-impression ratio: Above 60% indicates content freshness',
                'Save rate: Above 2% signals high-value content',
                'Click-through rate: 1-3% for story links and bio CTAs'
            ],
            budgetAllocationLogic: `Allocate 60% to creator compensation, 20% to content amplification (paid boost), 10% to creative assets, 10% to contingency and optimization buffer.`,
            riskAwareness: [
                'Creator deliverable delays — build 5-day buffer into timeline',
                'Content approval bottlenecks — establish clear revision limits (max 2 rounds)',
                'Platform algorithm changes may affect projected organic reach by 15-25%'
            ]
        };

        if (!genAI) return fallback;

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: GENERATION_CONFIG });
            const prompt = `${this.SYSTEM_IDENTITY}

TASK: Develop a comprehensive Campaign Strategy.

CAMPAIGN DETAILS:
- Category: ${campaignCategory || 'Not specified'}
- Budget: ${campaignBudget || 'Not specified'}
- Primary Goal: ${campaignGoal || 'Brand awareness'}
- Platform: ${platform || 'Instagram'}
- Duration: ${duration || 'Not specified'}

OUTPUT STRUCTURE (use these exact headers, respond in plain text, no markdown):

CAMPAIGN OBJECTIVE CLARIFICATION: [2-3 sentences clarifying the strategic objective and approach]

RECOMMENDED CONTENT FORMAT MIX:
- [Format 1 with percentage allocation and rationale]
- [Format 2 with percentage allocation and rationale]
- [Format 3 with percentage allocation and rationale]
- [Format 4 with percentage allocation and rationale]

POSTING FREQUENCY RECOMMENDATION: [Specific cadence with timing windows]

KPI BENCHMARKS:
- [KPI 1 with target range]
- [KPI 2 with target range]
- [KPI 3 with target range]
- [KPI 4 with target range]

BUDGET ALLOCATION LOGIC: [2-3 sentences with percentage breakdown and rationale]

RISK AWARENESS:
- [Risk 1 with mitigation]
- [Risk 2 with mitigation]
- [Risk 3 with mitigation]

CONSTRAINTS: No emojis. No filler. No hype. Be analytical and direct.`;

            const result = await model.generateContent(prompt);
            const text = result.response.text().trim();
            return this._parseStructuredOutput(text, 'campaignStrategy', fallback);
        } catch (error) {
            console.error('Campaign Strategy error:', error.message);
            return fallback;
        }
    }

    /**
     * Mode 4: ROI & Performance Forecast
     * Predictive performance modeling for campaign outcomes
     */
    static async runROIForecast({ campaignCategory, campaignBudget, creatorTier, platform, campaignGoal }) {
        const budgetNum = parseInt(campaignBudget) || 5000;
        const fallback = {
            estimatedEngagementRange: `Based on ${creatorTier || 'micro'}-tier creator benchmarks in ${campaignCategory || 'general'}, expect 2.5-4.5% engagement rate. Projected interactions: ${Math.round(budgetNum * 0.8)}-${Math.round(budgetNum * 2.2)} across all content deliverables.`,
            projectedROIBand: `Conservative: 1.8x return. Moderate: 2.5x return. Optimistic: 3.8x return. These projections assume standard content performance without paid amplification.`,
            riskProbability: [
                'Underperformance risk (below 1.5x ROI): 20% probability',
                'Platform algorithm suppression: 15% probability on any given post',
                'Creator deliverable quality variance: 25% probability of requiring revision'
            ],
            suggestedCreatorTier: `${creatorTier || 'Micro'}-influencer tier (10K-100K followers) recommended for this budget level. This tier delivers the highest cost-per-engagement efficiency while maintaining audience authenticity.`,
            confidenceInterval: 'Medium-High (78%) — forecast reliability increases with historical campaign data. First-time pairings carry inherently higher variance.'
        };

        if (!genAI) return fallback;

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: GENERATION_CONFIG });
            const prompt = `${this.SYSTEM_IDENTITY}

TASK: Generate an ROI & Performance Forecast for a planned campaign.

CAMPAIGN PARAMETERS:
- Category: ${campaignCategory || 'Not specified'}
- Budget: $${budgetNum}
- Creator Tier: ${creatorTier || 'Micro-influencer'}
- Platform: ${platform || 'Instagram'}
- Goal: ${campaignGoal || 'Brand awareness'}

OUTPUT STRUCTURE (use these exact headers, respond in plain text, no markdown):

ESTIMATED ENGAGEMENT RANGE: [Specific numeric ranges for engagement rate, impressions, and interactions]

PROJECTED ROI BAND: [Conservative, Moderate, and Optimistic scenarios with multipliers]

RISK PROBABILITY:
- [Risk 1 with percentage probability]
- [Risk 2 with percentage probability]
- [Risk 3 with percentage probability]

SUGGESTED CREATOR TIER: [Recommended tier with follower range and strategic justification]

CONFIDENCE INTERVAL: [Percentage with Low/Medium/High label and what would increase confidence]

CONSTRAINTS: No emojis. No filler. No hype. Use specific numbers and ranges. Be analytical and direct.`;

            const result = await model.generateContent(prompt);
            const text = result.response.text().trim();
            return this._parseStructuredOutput(text, 'roiForecast', fallback);
        } catch (error) {
            console.error('ROI Forecast error:', error.message);
            return fallback;
        }
    }

    /**
     * Mode 5: Optimization
     * Post-campaign performance analysis and improvement recommendations
     */
    static async runOptimization({ campaignCategory, platform, engagementRate, reach, conversions, contentTypes }) {
        const fallback = {
            performanceGapAnalysis: `Current engagement rate of ${engagementRate || 'N/A'}% against a category benchmark of 3.5% indicates ${(parseFloat(engagementRate) || 0) >= 3.5 ? 'above-benchmark performance' : 'a gap that requires content or targeting adjustments'}. Reach metrics should be cross-referenced with follower-to-impression ratio.`,
            whatWorked: [
                'Content formats with highest completion rates should be identified from analytics',
                'Posts with above-average save rates indicate high-value content pillars',
                'Audience segments with strongest interaction patterns represent core community'
            ],
            whatUnderperformed: [
                'Content types with below-average reach suggest format fatigue or topic misalignment',
                'Time slots with low engagement indicate suboptimal posting schedule',
                'Posts with high impressions but low interaction suggest weak hook or CTA structure'
            ],
            recommendedAdjustments: [
                'Reallocate 20% of budget from underperforming formats to top-performing content types',
                'Test 3 new hook structures in the next content cycle to improve watch-through rates',
                'Implement A/B testing on CTA placement and language for next campaign phase',
                'Adjust posting schedule based on audience active hours from analytics data'
            ],
            strategicNextStep: 'Run a 2-week test cycle with optimized content mix before scaling. Focus resources on the top 2 performing content formats and reduce investment in the bottom performer. Re-evaluate metrics at the 14-day mark.'
        };

        if (!genAI) return fallback;

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: GENERATION_CONFIG });
            const prompt = `${this.SYSTEM_IDENTITY}

TASK: Perform a campaign Optimization analysis.

PERFORMANCE DATA:
- Category: ${campaignCategory || 'Not specified'}
- Platform: ${platform || 'Instagram'}
- Engagement Rate: ${engagementRate || 'Not specified'}%
- Reach: ${reach || 'Not specified'}
- Conversions: ${conversions || 'Not specified'}
- Content Types Used: ${contentTypes || 'Not specified'}

OUTPUT STRUCTURE (use these exact headers, respond in plain text, no markdown):

PERFORMANCE GAP ANALYSIS: [2-3 sentences comparing actual performance against benchmarks]

WHAT WORKED:
- [Success factor 1 with supporting reasoning]
- [Success factor 2 with supporting reasoning]
- [Success factor 3 with supporting reasoning]

WHAT UNDERPERFORMED:
- [Weakness 1 with evidence]
- [Weakness 2 with evidence]
- [Weakness 3 with evidence]

RECOMMENDED ADJUSTMENTS:
- [Adjustment 1 with expected impact]
- [Adjustment 2 with expected impact]
- [Adjustment 3 with expected impact]
- [Adjustment 4 with expected impact]

STRATEGIC NEXT STEP: [2-3 sentences outlining the single most impactful next action]

CONSTRAINTS: No emojis. No filler. No hype. Be specific and data-oriented.`;

            const result = await model.generateContent(prompt);
            const text = result.response.text().trim();
            return this._parseStructuredOutput(text, 'optimization', fallback);
        } catch (error) {
            console.error('Optimization error:', error.message);
            return fallback;
        }
    }

    /**
     * Parse structured AI output into consistent object format
     * Falls back to raw text sections if parsing fails
     */
    static _parseStructuredOutput(text, mode, fallback) {
        try {
            const sections = {};
            const headerMap = {
                matchIntelligence: {
                    'MATCH FIT SCORE': 'matchFitScore',
                    'AUDIENCE ALIGNMENT SUMMARY': 'audienceAlignmentSummary',
                    'ENGAGEMENT RELIABILITY ASSESSMENT': 'engagementReliabilityAssessment',
                    'RISK FACTORS': 'riskFactors',
                    'SUGGESTED CAMPAIGN ANGLE': 'suggestedCampaignAngle',
                    'CONFIDENCE LEVEL': 'confidenceLevel'
                },
                creatorAudit: {
                    'ENGAGEMENT CONSISTENCY ANALYSIS': 'engagementConsistencyAnalysis',
                    'GROWTH STABILITY OVERVIEW': 'growthStabilityOverview',
                    'AUTHENTICITY INDICATORS': 'authenticityIndicators',
                    'NICHE AUTHORITY LEVEL': 'nicheAuthorityLevel',
                    'STRENGTHS': 'strengths',
                    'IMPROVEMENT AREAS': 'improvementAreas',
                    'RISK INDEX': 'riskIndex'
                },
                campaignStrategy: {
                    'CAMPAIGN OBJECTIVE CLARIFICATION': 'campaignObjectiveClarification',
                    'RECOMMENDED CONTENT FORMAT MIX': 'recommendedContentFormatMix',
                    'POSTING FREQUENCY RECOMMENDATION': 'postingFrequencyRecommendation',
                    'KPI BENCHMARKS': 'kpiBenchmarks',
                    'BUDGET ALLOCATION LOGIC': 'budgetAllocationLogic',
                    'RISK AWARENESS': 'riskAwareness'
                },
                roiForecast: {
                    'ESTIMATED ENGAGEMENT RANGE': 'estimatedEngagementRange',
                    'PROJECTED ROI BAND': 'projectedROIBand',
                    'RISK PROBABILITY': 'riskProbability',
                    'SUGGESTED CREATOR TIER': 'suggestedCreatorTier',
                    'CONFIDENCE INTERVAL': 'confidenceInterval'
                },
                optimization: {
                    'PERFORMANCE GAP ANALYSIS': 'performanceGapAnalysis',
                    'WHAT WORKED': 'whatWorked',
                    'WHAT UNDERPERFORMED': 'whatUnderperformed',
                    'RECOMMENDED ADJUSTMENTS': 'recommendedAdjustments',
                    'STRATEGIC NEXT STEP': 'strategicNextStep'
                }
            };

            const headers = headerMap[mode];
            if (!headers) return fallback;

            const headerKeys = Object.keys(headers);
            const lines = text.split('\n');
            let currentKey = null;
            let currentContent = [];

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;

                // Check if this line is a section header
                const matchedHeader = headerKeys.find(h => 
                    trimmed.toUpperCase().startsWith(h) && (trimmed.includes(':') || trimmed.toUpperCase() === h)
                );

                if (matchedHeader) {
                    // Save previous section
                    if (currentKey) {
                        sections[headers[currentKey]] = this._formatSection(currentContent);
                    }
                    currentKey = matchedHeader;
                    // Grab inline content after the header
                    const afterColon = trimmed.substring(trimmed.indexOf(':') + 1).trim();
                    currentContent = afterColon ? [afterColon] : [];
                } else if (currentKey) {
                    currentContent.push(trimmed);
                }
            }
            // Save last section
            if (currentKey) {
                sections[headers[currentKey]] = this._formatSection(currentContent);
            }

            // If we parsed at least 3 sections, use parsed result; otherwise fallback
            if (Object.keys(sections).length >= 3) {
                // Merge with fallback to ensure all keys exist
                const result = { ...fallback };
                for (const [key, value] of Object.entries(sections)) {
                    if (value && (typeof value === 'string' ? value.length > 5 : value.length > 0)) {
                        result[key] = value;
                    }
                }
                // Special handling: matchFitScore should be numeric
                if (mode === 'matchIntelligence' && typeof result.matchFitScore === 'string') {
                    const scoreMatch = result.matchFitScore.match(/(\d+)/);
                    result.matchFitScore = scoreMatch ? parseInt(scoreMatch[1]) : fallback.matchFitScore;
                }
                return result;
            }

            return fallback;
        } catch (error) {
            console.error('Parse error:', error.message);
            return fallback;
        }
    }

    /**
     * Format a section's content — returns array for bullet lists, string for paragraphs
     */
    static _formatSection(lines) {
        const bulletLines = lines.filter(l => l.startsWith('-') || l.startsWith('•'));
        if (bulletLines.length >= 2) {
            return bulletLines.map(l => l.replace(/^[-•]\s*/, '').trim());
        }
        return lines.join(' ').trim();
    }
}

module.exports = AIContentService;

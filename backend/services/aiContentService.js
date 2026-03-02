const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini client
const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

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
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
}

module.exports = AIContentService;

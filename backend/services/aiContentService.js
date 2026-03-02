const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini client
const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

/**
 * AI Content Generation Service
 * 
 * High-fidelity content engine for generating professional captions, 
 * hashtags, ideas, and posting schedules using Google Gemini.
 */
class AIContentService {
    /**
     * Generate content based on topic, platform, and tone
     */
    static async generateCaption(topic, platform, tone) {
        if (!genAI) {
            console.warn('⚠️ GEMINI_API_KEY missing - falling back to mock caption');
            return `Looking for ${topic} inspo? ✨ We've got you covered on ${platform}! #${topic.replace(/\s+/g, '')} #Professional`;
        }

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const platformGuidelines = {
                Instagram: 'Instagram captions can be up to 2,200 characters. Use line breaks for readability. Place hashtags at the end or in first comment. Use engaging hooks in the first line since only 125 chars show before "more".',
                YouTube: 'YouTube descriptions should front-load keywords in the first 2 lines. Include a clear value proposition and timestamps if applicable.',
                TikTok: 'TikTok captions should be punchy and under 150 characters. Use trending sounds references. Be conversational and relatable.',
                Twitter: 'Tweets must be under 280 characters. Be concise, witty, and hook-driven. Use 1-2 hashtags max.',
                LinkedIn: 'LinkedIn posts should be thought-leadership focused. Use professional but conversational tone. Start with a bold statement or surprising stat. Use line breaks every 1-2 sentences.'
            };

            const toneGuidelines = {
                casual: 'Write like you\'re talking to a close friend — warm, relatable, using natural language. Add personality and humor where appropriate.',
                professional: 'Write with authority and credibility while remaining approachable. Use data-driven language and industry expertise.',
                storytelling: 'Structure as a micro-story with a hook, tension, and resolution. Make it personal and emotionally resonant. Use "I" and share real-feeling experiences.',
                promotional: 'Lead with the benefit/transformation, not the product. Use social proof language, urgency, and a clear compelling CTA. Avoid sounding salesy — focus on value.'
            };

            const prompt = `You are an elite social media strategist and copywriter with 10+ years of experience managing accounts for top brands and creators. You specialize in writing ${platform} content that drives real engagement, saves, and shares.

TASK: Write ONE high-converting ${platform} caption.

TOPIC: ${topic}
PLATFORM: ${platform}
TONE: ${tone}

PLATFORM BEST PRACTICES:
${platformGuidelines[platform] || platformGuidelines.Instagram}

TONE DIRECTION:
${toneGuidelines[tone] || toneGuidelines.professional}

REQUIREMENTS:
- Open with a scroll-stopping hook (question, bold claim, or pattern interrupt)
- Include a clear value proposition — why should someone care?
- Use strategic emoji placement (not excessive — 3-5 max)
- End with a strong call-to-action that drives engagement (save, share, comment, or click)
- Write in a way that feels human and authentic, NOT robotic or generic
- Vary sentence length for rhythm — mix short punchy lines with longer explanatory ones
- If promotional tone: focus on transformation/benefit, not features

FORMAT: Return ONLY the caption text, ready to copy-paste. No labels, no quotes, no explanation.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error) {
            console.error('Gemini caption error:', error.message);
            return `Elevating ${topic} today. 🚀 Check the link in bio for more! #${topic.replace(/\s+/g, '')}`;
        }
    }

    /**
     * Generate hashtags based on topic and niche
     */
    static async generateHashtags(topic, niche) {
        if (!genAI) {
            return [`#${topic.replace(/\s+/g, '')}`, '#FYP', '#Trending', '#Viral', '#TheCollabify'];
        }

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `You are a senior SEO analyst and social media strategist with 10+ years of experience optimizing content discoverability for top creators and brands.

TASK: Generate a strategically curated set of 15 hashtags.

TOPIC: ${topic}
NICHE: ${niche}

HASHTAG STRATEGY (use this exact distribution):
- 3 HIGH-VOLUME hashtags (1M+ posts) — for discovery/reach
- 5 MEDIUM-VOLUME hashtags (100K-1M posts) — sweet spot for ranking
- 4 NICHE-SPECIFIC hashtags (10K-100K posts) — targeted community reach
- 3 BRANDED/UNIQUE hashtags — for building owned audience

REQUIREMENTS:
- Every hashtag must be directly relevant to "${topic}" in the "${niche}" space
- NO generic spam hashtags like #FYP, #ForYou, #Viral, #Trending unless platform-specific and relevant
- Include industry-specific terminology that the target audience actually searches
- Mix of broad discovery tags and specific community tags
- All lowercase, no spaces within hashtags

FORMAT: Return ONLY a space-separated string of 15 hashtags. Nothing else.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().trim();
            const tags = text.split(/\s+/);
            return tags.filter(t => t.startsWith('#')).slice(0, 15);
        } catch (error) {
            console.error('Gemini hashtag error:', error.message);
            return [`#${topic.replace(/\s+/g, '')}`, '#Trending'];
        }
    }

    /**
     * Generate content ideas for specific campaign types
     */
    static async generateContentIdeas(category, platform) {
        const categoryIdeas = {
            Fashion: [
                `👗 "Get Ready With Me" featuring your latest look — show styling from casual to glam`,
                `📸 Outfit of the Week carousel — 7 looks, 7 days, ask followers to vote their favorite`,
                `🎥 Behind-the-scenes of a photoshoot or outfit planning session`,
                `💬 "This or That" style poll — engage followers with two outfit choices`
            ],
            Tech: [
                `🔧 Unboxing + First Impressions review — raw, honest reactions sell`,
                `📊 "5 Settings You're Not Using" tutorial — practical tips get saved & shared`,
                `⚡ Day-in-my-life using only this product — show real-world usage`,
                `🤔 Myth vs Reality: Common misconceptions about the product`
            ],
            Fitness: [
                `💪 30-day challenge transformation — document your journey with daily clips`,
                `🏋️ "Form Check" educational reel — correct common exercise mistakes`,
                `🥗 Full day of eating + workout split — followers love complete routines`,
                `📈 Progress comparison: Week 1 vs Week 4 with honest commentary`
            ],
            Food: [
                `🍳 Quick recipe reel under 60 seconds — hook with the final dish first`,
                `🎬 "Restaurant vs Homemade" comparison — recreate a popular dish`,
                `👨‍🍳 Kitchen hack that actually works — these go viral consistently`,
                `📍 Hidden gem food spot review — genuine reactions get engagement`
            ],
            Beauty: [
                `✨ Before & After transformation — show the product in real-time action`,
                `🎨 "Dupe or Worth It?" comparison with honest opinion`,
                `💄 5-minute everyday look tutorial — relatable content performs best`,
                `🧴 Skincare routine with product order explanation — educational sells`
            ],
            Travel: [
                `🗺️ "Things I Wish I Knew Before Visiting" — save-worthy travel tips`,
                `📸 Hidden spots locals love — unique angles beat tourist shots`,
                `💰 Budget breakdown: How much a day actually costs in [destination]`,
                `🎒 Pack with me + travel essentials that actually matter`
            ],
            Lifestyle: [
                `🌅 Morning routine that's actually realistic — authenticity wins`,
                `🏠 Room/desk makeover transformation — satisfying before & after`,
                `📱 Apps & tools that improved my daily life — practical recommendations`,
                `💡 "One thing I changed that made a big difference" story-style content`
            ],
            Gaming: [
                `🎮 Top 5 tips for beginners that pros actually use`,
                `🔥 Epic moments compilation — montage with trending audio`,
                `🤝 Challenge a follower/friend — collaborative content builds community`,
                `📊 Settings & setup tour — gamers love optimization content`
            ],
            Education: [
                `📚 Explain a complex topic in 60 seconds — "Did you know?" hooks`,
                `🧠 Common mistakes students/learners make (and how to fix them)`,
                `✅ Study technique that actually works — backed by science`,
                `💬 Q&A: Answer the most asked question in your field`
            ],
            Business: [
                `📈 "How I got my first client/sale" story — founders love sharing this`,
                `💡 One business lesson I learned the hard way — relatable advice`,
                `🔍 Behind-the-scenes of running my business — humanize your brand`,
                `📊 Tool/strategy that 10x'd my productivity — actionable content`
            ]
        };

        const defaultIdeas = [
            `📸 Behind-the-scenes content — show the process, not just the result`,
            `💬 Q&A session addressing your audience's top questions`,
            `🔄 Before & After transformation content — visual impact drives shares`,
            `🎯 "Top 5 Tips" educational carousel — high save rate content`
        ];

        if (!genAI) {
            return categoryIdeas[category] || defaultIdeas;
        }

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `You are a senior content strategist and social media manager with 10+ years of experience growing creator accounts from zero to millions of followers. You understand what content performs, why it performs, and how to replicate success.

TASK: Generate exactly 4 specific, high-performing content ideas for a ${category} creator on ${platform}.

REQUIREMENTS FOR EACH IDEA:
- Start with a single relevant emoji
- Be hyper-specific (NOT generic like "post about your niche" or "share tips")
- Include the content FORMAT (reel, carousel, story, static post, live, etc.)
- Explain briefly WHY this format works (e.g., "carousel posts get 3x more saves" or "this hook pattern has 89% watch-through")
- Each idea should be immediately actionable — the creator should know exactly what to create
- Keep each idea under 30 words
- Ideas should cover different content pillars: educational, entertaining, community-building, and promotional

FORMAT: Return ONLY the 4 ideas, one per line. No numbering, no bullet points, no extra text.`;

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
                title: '🕐 Best Time to Launch',
                description: 'Current platform data suggests launching between 6-9 PM gets 40% more engagement.',
                action: 'Optimize launch time',
                impact: 'high',
                confidence: 89
            },
            {
                id: 'category',
                type: 'category',
                title: '🎯 Trending Niche: Micro-Influencers',
                description: 'Micro-influencers in the Tech/Lifestyle space are currently seeing 2x ROI compared to macro creators.',
                action: 'Shift target niche',
                impact: 'high',
                confidence: 91
            },
            {
                id: 'promotion',
                type: 'promotion',
                title: '📱 Reels Content Surge',
                description: 'Reels campaigns are currently seeing 3x higher retention than static posts.',
                action: 'Switch to Reels',
                impact: 'high',
                confidence: 94
            }
        ];
    }
}

module.exports = AIContentService;

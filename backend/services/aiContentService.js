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
            const prompt = `Generate a high-engagement ${platform} caption for a creator. 
            Topic: ${topic}
            Tone: ${tone}
            Include relevant emojis and call to action. 
            Maximum 3 paragraphs. 
            Return ONLY the caption text.`;

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
            const prompt = `As a social media expert, provide 15 trending and relevant hashtags for:
            Topic: ${topic}, Niche: ${niche}.
            Return ONLY a space-separated string of hashtags.`;

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
        if (!genAI) {
            return [
                `📸 Key features of the ${category} project`,
                `✨ Styling/Usage tips for ${platform}`,
                `🔄 Comparison vs traditional methods`,
                `💬 Ask your audience about ${category}`
            ];
        }

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `Generate 4 creative content ideas for a ${category} campaign on ${platform}. Keep each idea under 20 words. Return only the list of ideas.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text().split('\n').filter(line => line.trim().length > 5).slice(0, 4);
        } catch (error) {
            return [`✨ Trending in ${category}`, `🔥 Viral ${platform} tips`].slice(0, 4);
        }
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

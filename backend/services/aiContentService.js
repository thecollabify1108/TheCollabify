/**
 * AI Content Generation Service
 * 
 * Currently using mock/rule-based generation to demonstrate functionality 
 * without requiring an API key. 
 * 
 * TODO: Replace generate methods with OpenAI/Anthropic API calls in production.
 */

class AIContentService {
    /**
     * Generate content based on topic, platform, and tone
     */
    static async generateCaption(topic, platform, tone) {
        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 1500));

        const templates = {
            professional: {
                linkedin: [
                    `Excited to share my thoughts on ${topic}. It's a game-changer for the industry. What are your perspectives? #Professional #${topic.replace(/\s+/g, '')} #Growth`,
                    `Exploring the impact of ${topic} on today's market. Only by staying ahead can we truly innovate. #${topic.replace(/\s+/g, '')} #Business`,
                    `Reflecting on ${topic} and what it means for the future of our work. Consistency is key. #${topic.replace(/\s+/g, '')} #Motivation`
                ],
                twitter: [
                    `Big things coming with ${topic}. Stay tuned. 🚀 #${topic.replace(/\s+/g, '')}`,
                    `Here's why ${topic} matters more than ever. 🧵👇`,
                    `Just finished a deep dive into ${topic}. The results are surprising. 📊 #${topic.replace(/\s+/g, '')}`
                ],
                instagram: [
                    `Behind the scenes working on ${topic}. Consistency creates mastery. ✨\n\n#${topic.replace(/\s+/g, '')} #WorkMode #Goals`,
                    `Bringing ${topic} to life. Every detail counts. 💼\n\nLink in bio for more!\n\n#${topic.replace(/\s+/g, '')} #Creator`,
                    `Leveling up with ${topic}. Ready for what's next. 🚀\n\n#${topic.replace(/\s+/g, '')} #Mindset`
                ]
            },
            fun: {
                instagram: [
                    `Just another day obsessing over ${topic} 😂 Who else relates??\n\n#${topic.replace(/\s+/g, '')} #Fun #Vibes`,
                    `You: ${topic} isn't that cool.\nMe: 🤯✨🔥\n\n#${topic.replace(/\s+/g, '')} #Trending`,
                    `Current mood: ${topic} all day every day. 🌈✨\n\n#${topic.replace(/\s+/g, '')} #Mood`
                ],
                tiktok: [
                    `Tell me you love ${topic} without telling me you love ${topic}... I'll go first. 🤪 #${topic.replace(/\s+/g, '')}`,
                    `POV: You just discovered ${topic} ✨👄✨ #${topic.replace(/\s+/g, '')} #fyp`,
                    `When ${topic} hits just right 😮💨 #${topic.replace(/\s+/g, '')} #viral`
                ],
                twitter: [
                    `If ${topic} has 0 fans, I am dead. 💀`,
                    `Thinking about ${topic} again... send help. 😂`,
                    `${topic}. That's the tweet. ✨`
                ]
            },
            witty: {
                instagram: [
                    `They said ${topic} couldn't be done. Hold my coffee. ☕️😏\n\n#${topic.replace(/\s+/g, '')} #Challenge`,
                    `Maybe she's born with it, maybe it's ${topic}. ✨💅\n\n#${topic.replace(/\s+/g, '')} #Style`,
                    `Keep your friends close and your ${topic} closer. 👀\n\n#${topic.replace(/\s+/g, '')} #Wisdom`
                ],
                twitter: [
                    `I don't know who needs to hear this, but ${topic} is the answer. 💅`,
                    `My toxic trait is thinking I can master ${topic} in one day. 🙃`,
                    `Me 🤝 ${topic} \n     Validation`
                ],
                linkedin: [
                    `Unpopular opinion: ${topic} is actually over-rated... just kidding. Here's why. 😉 #${topic.replace(/\s+/g, '')}`,
                    `Work smart, not hard. Or just use ${topic}. 🧠 #${topic.replace(/\s+/g, '')}`,
                    `Stop ignoring ${topic}. It's time to pay attention. 🚨 #${topic.replace(/\s+/g, '')}`
                ]
            }
        };

        const platformKey = platform.toLowerCase();
        const toneKey = tone.toLowerCase();

        // Fallback logic
        const toneTemplates = templates[toneKey] || templates.professional;
        const platformTemplates = toneTemplates[platformKey] || toneTemplates.instagram;

        // Get random template
        const randomIndex = Math.floor(Math.random() * platformTemplates.length);
        return platformTemplates[randomIndex];
    }

    /**
     * Generate hashtags based on topic and niche
     */
    static async generateHashtags(topic, niche) {
        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 800));

        const baseTags = [
            `#${topic.replace(/\s+/g, '')}`,
            `#${topic.replace(/\s+/g, '')}Life`,
            `#${topic.replace(/\s+/g, '')}Tips`,
            `#${niche.replace(/\s+/g, '')}`,
            `#${niche.replace(/\s+/g, '')}Creator`
        ];

        const trendingTags = [
            '#FYP', '#Trending', '#Viral', '#ExplorePage', '#Creator', '#Inspo'
        ];

        // Combine and shuffle
        const allTags = [...baseTags, ...trendingTags];
        const shuffled = allTags.sort(() => 0.5 - Math.random());

        return shuffled.slice(0, 8); // Return 8 hashtags
    }
}

module.exports = AIContentService;

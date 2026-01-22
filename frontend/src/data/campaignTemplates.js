const campaignTemplates = [
    {
        id: 'product-launch',
        name: 'Product Launch',
        icon: '🚀',
        description: 'Launch a new product with maximum impact',
        category: 'Marketing',
        template: {
            title: 'New Product Launch Campaign',
            promotionType: 'Reel',
            budget: 5000,
            description: 'Help us launch our exciting new product! We\'re looking for creative influencers to showcase our latest innovation through engaging reels that highlight key features and benefits.',
            requirements: '- Create 1 Instagram Reel (30-60 seconds)\n- Showcase product features creatively\n- Include product unboxing\n- Use our brand hashtags\n- Tag our official account\n- Add swipe-up link (if available)',
            targetNiche: ['Fashion', 'Tech', 'Lifestyle'],
            minFollowers: 10000,
            maxFollowers: 100000,
            duration: 30
        }
    },
    {
        id: 'brand-awareness',
        name: 'Brand Awareness',
        icon: '📢',
        description: 'Build brand recognition and reach',
        category: 'Branding',
        template: {
            title: 'Brand Awareness Campaign',
            promotionType: 'Post',
            budget: 3000,
            description: 'Increase our brand visibility! We\'re seeking influencers to create authentic content that introduces our brand to their audience and highlights what makes us unique.',
            requirements: '- Create 2-3 Instagram Posts\n- Share your genuine experience\n- Use brand storytelling\n- Include our brand hashtags\n- Mention our unique value proposition\n- Engage with comments',
            targetNiche: ['Lifestyle', 'Fashion', 'Beauty'],
            minFollowers: 5000,
            maxFollowers: 50000,
            duration: 21
        }
    },
    {
        id: 'seasonal-campaign',
        name: 'Seasonal Special',
        icon: '🎄',
        description: 'Leverage seasonal trends',
        category: 'Seasonal',
        template: {
            title: 'Festive Season Campaign',
            promotionType: 'Story',
            budget: 2500,
            description: 'Celebrate the season with us! Create festive content that showcases our products in a seasonal context, perfect for holiday shopping.',
            requirements: '- Create 5-7 Instagram Stories\n- Festive/seasonal theme\n- Show product in use\n- Limited time offer mention\n- Swipe-up for sales\n- Post during peak hours',
            targetNiche: ['Lifestyle', 'Fashion', 'Food'],
            minFollowers: 3000,
            maxFollowers: 30000,
            duration: 14
        }
    },
    {
        id: 'giveaway',
        name: 'Contest & Giveaway',
        icon: '🎁',
        description: 'Boost engagement with giveaways',
        category: 'Engagement',
        template: {
            title: 'Exciting Giveaway Campaign',
            promotionType: 'Post',
            budget: 4000,
            description: 'Host an exciting giveaway! Partner with us to give away amazing prizes to your followers, driving engagement and growing both our audiences.',
            requirements: '- Host giveaway post\n- Clear entry instructions\n- Tag our brand\n- Use specific hashtags\n- Run for 7 days\n- Announce winner publicly\n- Follow contest guidelines',
            targetNiche: ['Lifestyle', 'Beauty', 'Tech', 'Fashion'],
            minFollowers: 15000,
            maxFollowers: 150000,
            duration: 14
        }
    },
    {
        id: 'tutorial-review',
        name: 'Tutorial & Review',
        icon: '📹',
        description: 'Educational content with product demo',
        category: 'Educational',
        template: {
            title: 'Product Tutorial & Review',
            promotionType: 'Video',
            budget: 6000,
            description: 'Create an in-depth tutorial or review! Show your audience how to use our product effectively with step-by-step guidance and honest feedback.',
            requirements: '- Create tutorial video (3-5 min)\n- Step-by-step demonstration\n- Honest review and feedback\n- Before/after if applicable\n- Answer common questions\n- Include discount code',
            targetNiche: ['Tech', 'Beauty', 'Fitness', 'Lifestyle'],
            minFollowers: 20000,
            maxFollowers: 200000,
            duration: 30
        }
    },
    {
        id: 'micro-influencer',
        name: 'Micro-Influencer',
        icon: '⭐',
        description: 'High engagement, authentic reach',
        category: 'Targeted',
        template: {
            title: 'Micro-Influencer Collaboration',
            promotionType: 'Post',
            budget: 2000,
            description: 'Authentic partnerships with micro-influencers! We value genuine connections and high engagement over follower count.',
            requirements: '- Create authentic content\n- Share personal story\n- Natural product integration\n- High-quality photos\n- Engage with your community\n- Long-term partnership potential',
            targetNiche: ['Lifestyle', 'Food', 'Travel', 'Fashion'],
            minFollowers: 1000,
            maxFollowers: 10000,
            duration: 21
        }
    },
    {
        id: 'unboxing',
        name: 'Unboxing Experience',
        icon: '📦',
        description: 'First impressions and packaging reveal',
        category: 'Product',
        template: {
            title: 'Unboxing & First Impressions',
            promotionType: 'Reel',
            budget: 3500,
            description: 'Capture the excitement of unboxing! Create engaging content showing the packaging experience and initial product impressions.',
            requirements: '- Film unboxing process\n- Show packaging details\n- First impressions reaction\n- Product close-ups\n- Aesthetic presentation\n- Genuine excitement',
            targetNiche: ['Tech', 'Beauty', 'Fashion', 'Gadgets'],
            minFollowers: 8000,
            maxFollowers: 80000,
            duration: 14
        }
    },
    {
        id: 'lifestyle-integration',
        name: 'Lifestyle Integration',
        icon: '✨',
        description: 'Product in daily life context',
        category: 'Lifestyle',
        template: {
            title: 'Day in the Life Campaign',
            promotionType: 'Story',
            budget: 2800,
            description: 'Show how our product fits into your daily routine! Create relatable content that demonstrates real-world usage.',
            requirements: '- Multiple story posts\n- Show daily integration\n- Natural product placement\n- Behind-the-scenes content\n- Authentic usage scenarios\n- Q&A with followers',
            targetNiche: ['Lifestyle', 'Wellness', 'Fashion', 'Food'],
            minFollowers: 5000,
            maxFollowers: 50000,
            duration: 7
        }
    },
    {
        id: 'comparison-review',
        name: 'Comparison Review',
        icon: '⚖️',
        description: 'Product comparison and analysis',
        category: 'Review',
        template: {
            title: 'Comparison & Analysis Campaign',
            promotionType: 'Video',
            budget: 5500,
            description: 'Provide an honest comparison! Help your audience make informed decisions by comparing our product with alternatives.',
            requirements: '- Compare with similar products\n- Highlight unique features\n- Pros and cons analysis\n- Value for money assessment\n- Honest recommendation\n- Detailed review',
            targetNiche: ['Tech', 'Beauty', 'Gadgets', 'Lifestyle'],
            minFollowers: 25000,
            maxFollowers: 250000,
            duration: 30
        }
    },
    {
        id: 'quick-promo',
        name: 'Quick Promo',
        icon: '⚡',
        description: 'Fast turnaround promotional content',
        category: 'Quick',
        template: {
            title: 'Quick Promotional Campaign',
            promotionType: 'Story',
            budget: 1500,
            description: 'Fast and effective promotion! Perfect for time-sensitive offers or flash sales.',
            requirements: '- Create within 24 hours\n- 3-5 story slides\n- Clear CTA\n- Time-limited offer\n- Swipe-up link\n- High urgency messaging',
            targetNiche: ['Lifestyle', 'Fashion', 'Beauty', 'Food'],
            minFollowers: 3000,
            maxFollowers: 30000,
            duration: 3
        }
    }
];

// Helper function to get templates by category
export const getTemplatesByCategory = (category) => {
    if (!category) return campaignTemplates;
    return campaignTemplates.filter(t => t.category === category);
};

// Helper function to get template by ID
export const getTemplateById = (id) => {
    return campaignTemplates.find(t => t.id === id);
};

// Get all unique categories
export const getCategories = () => {
    const categories = [...new Set(campaignTemplates.map(t => t.category))];
    return categories;
};

export default campaignTemplates;

/**
 * Professional Campaign Templates for TheCollabify
 */

const campaignTemplates = [
    {
        id: 'fashion-launch',
        name: 'Fashion Brand Launch',
        description: 'Ideal for new apparel collections and fashion startups.',
        category: 'Fashion',
        icon: '👗',
        template: {
            title: 'Summer Collection Showcase',
            description: 'Showcase our new eco-friendly summer collection through stylish content.',
            promotionType: 'Post',
            budget: 15000,
            duration: 14,
            minFollowers: 5000,
            maxFollowers: 50000,
            minEngagement: 3.5,
            targetNiche: ['Fashion', 'Lifestyle']
        }
    },
    {
        id: 'tech-review',
        name: 'Tech Gadget Review',
        description: 'Deep-dive reviews for electronics and consumer tech.',
        category: 'Tech',
        icon: '📱',
        template: {
            title: 'Unboxing & In-depth Review',
            description: 'Provide an honest review and unboxing of our latest wireless headphones.',
            promotionType: 'Video',
            budget: 25000,
            duration: 21,
            minFollowers: 10000,
            maxFollowers: 100000,
            minEngagement: 4.0,
            targetNiche: ['Tech', 'Gaming']
        }
    },
    {
        id: 'beauty-tutorial',
        name: 'Beauty & Skincare Tutorial',
        description: 'Step-by-step product usage and routine showcases.',
        category: 'Beauty',
        icon: '💄',
        template: {
            title: 'Morning Skincare Routine',
            description: 'Integrate our hydrating serum into your daily morning routine video.',
            promotionType: 'Reel',
            budget: 12000,
            duration: 7,
            minFollowers: 2000,
            maxFollowers: 25000,
            minEngagement: 4.5,
            targetNiche: ['Beauty', 'Lifestyle']
        }
    },
    {
        id: 'fitness-challenge',
        name: 'Fitness Transformation',
        description: 'Long-term partnership for fitness programs and supplements.',
        category: 'Fitness',
        icon: '💪',
        template: {
            title: '30-Day Fitness Challenge',
            description: 'Share your journey using our daily performance supplements.',
            promotionType: 'Story',
            budget: 18000,
            duration: 30,
            minFollowers: 5000,
            maxFollowers: 75000,
            minEngagement: 3.0,
            targetNiche: ['Fitness', 'Food']
        }
    }
];

export const getCategories = () => {
    return Array.from(new Set(campaignTemplates.map(t => t.category)));
};

export default campaignTemplates;

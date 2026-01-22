/**
 * AI Content Generator Service
 * Generates captions, hashtags, and content ideas for campaigns
 */

// Pre-defined caption templates and styles
const captionStyles = {
    casual: {
        starters: [
            "Hey fam! 🙌",
            "What's up everyone! ✨",
            "Guess what? 🎉",
            "OMG you guys! 😍",
            "Real talk... 💯"
        ],
        connectors: [
            "So basically,",
            "Here's the thing,",
            "You know what,",
            "Fun fact:",
            "Plot twist:"
        ],
        endings: [
            "Let me know what you think! 💬",
            "Comment below! 👇",
            "Tag a friend who needs this! 🔥",
            "Save this for later! 📌",
            "Share if you agree! ❤️"
        ]
    },
    professional: {
        starters: [
            "Excited to share",
            "Introducing",
            "Delighted to announce",
            "Proud to present",
            "Thrilled to collaborate with"
        ],
        connectors: [
            "This partnership brings",
            "What makes this special is",
            "The key highlight is",
            "What sets this apart is",
            "Here's what you need to know:"
        ],
        endings: [
            "Learn more in my bio! 🔗",
            "Swipe up for details! ⬆️",
            "Link in bio! 💼",
            "DM for more info! 📩",
            "Check it out! ✨"
        ]
    },
    storytelling: {
        starters: [
            "Let me tell you a story...",
            "Picture this:",
            "Remember when...",
            "Here's how it started:",
            "My journey with..."
        ],
        connectors: [
            "And then,",
            "The turning point was",
            "What happened next was",
            "But here's the best part:",
            "Little did I know,"
        ],
        endings: [
            "And that's my story! 📖",
            "What's yours? Share below! 💭",
            "The end... or is it? 🤔",
            "To be continued... ✨",
            "Your turn! Share your experience! 🙌"
        ]
    },
    promotional: {
        starters: [
            "🔥 EXCITING NEWS! 🔥",
            "⚡ LIMITED TIME ONLY! ⚡",
            "🎁 SPECIAL OFFER ALERT! 🎁",
            "💥 BIG ANNOUNCEMENT! 💥",
            "🌟 DON'T MISS THIS! 🌟"
        ],
        connectors: [
            "For the next 24 hours,",
            "This exclusive deal includes:",
            "What you get:",
            "Special perks:",
            "Limited spots available!"
        ],
        endings: [
            "Grab yours NOW! ⏰",
            "Link in bio - Act fast! 🏃",
            "Limited time only! ⚡",
            "Don't wait! 🚀",
            "While stocks last! 🔔"
        ]
    }
};

// Hashtag database by category
const hashtagDatabase = {
    Fashion: {
        primary: ['#Fashion', '#Style', '#OOTD', '#FashionBlogger', '#Fashionista'],
        secondary: ['#InstaFashion', '#Trendy', '#StyleInspo', '#FashionAddict', '#Stylish'],
        trending: ['#FashionWeek', '#StreetStyle', '#SustainableFashion', '#VintageFashion']
    },
    Beauty: {
        primary: ['#Beauty', '#Makeup', '#Skincare', '#BeautyBlogger', '#MakeupArtist'],
        secondary: ['#BeautyTips', '#MakeupLover', '#GlowUp', '#SkincareRoutine', '#BeautyAddict'],
        trending: ['#CleanBeauty', '#KBeauty', '#MakeupTutorial', '#SelfCare']
    },
    Tech: {
        primary: ['#Tech', '#Technology', '#Gadgets', '#Innovation', '#TechReview'],
        secondary: ['#TechNews', '#GadgetLover', '#SmartTech', '#TechLife', '#Digital'],
        trending: ['#AI', '#IoT', '#5G', '#SmartHome', '#FutureTech']
    },
    Lifestyle: {
        primary: ['#Lifestyle', '#LifestyleBlogger', '#DailyLife', '#Inspiration', '#Motivation'],
        secondary: ['#LifeGoals', '#Positivity', '#SelfImprovement', '#HealthyLiving', '#Wellness'],
        trending: ['#Mindfulness', '#SelfLove', '#PersonalGrowth', '#WorkLifeBalance']
    },
    Food: {
        primary: ['#Food', '#Foodie', '#FoodPorn', '#Delicious', '#FoodBlogger'],
        secondary: ['#InstaFood', '#Yummy', '#FoodPhotography', '#FoodLover', '#Tasty'],
        trending: ['#HealthyEating', '#FoodieLife', '#HomeCooking', '#RecipeOfTheDay']
    },
    Travel: {
        primary: ['#Travel', '#Wanderlust', '#TravelBlogger', '#Explore', '#Adventure'],
        secondary: ['#TravelGram', '#InstaTravel', '#Traveling', '#WorldTravel', '#TravelLife'],
        trending: ['#SustainableTravel', '#SoloTravel', '#TravelGoals', '#HiddenGems']
    },
    Fitness: {
        primary: ['#Fitness', '#Workout', '#Gym', '#FitnessMotivation', '#FitLife'],
        secondary: ['#FitnessJourney', '#GymLife', '#WorkoutMotivation', '#FitFam', '#Training'],
        trending: ['#HomeWorkout', '#HIIT', '#YogaLife', '#FitnessGoals']
    }
};

// Emoji sets by mood
const emojiSets = {
    excited: ['🎉', '✨', '🌟', '💫', '🔥', '⭐', '🚀', '💥'],
    love: ['❤️', '💕', '💖', '💗', '💓', '💝', '💞', '😍'],
    happy: ['😊', '😄', '😃', '🙂', '😁', '🥰', '☺️', '😌'],
    cool: ['😎', '🤩', '🔥', '💯', '👌', '✌️', '🤘', '💪'],
    creative: ['🎨', '🖌️', '✏️', '🎭', '🎪', '🎬', '📸', '🎵']
};

/**
 * Generate AI caption
 */
export const generateCaption = (params) => {
    const {
        productName = 'this amazing product',
        brandName = 'the brand',
        category = 'Lifestyle',
        style = 'casual', // casual, professional, storytelling, promotional
        tone = 'excited', // excited, love, happy, cool, creative
        includeEmojis = true,
        length = 'medium' // short, medium, long
    } = params;

    const templates = captionStyles[style] || captionStyles.casual;
    const emojis = includeEmojis ? emojiSets[tone] || emojiSets.excited : [];

    // Randomly select components
    const starter = templates.starters[Math.floor(Math.random() * templates.starters.length)];
    const connector = templates.connectors[Math.floor(Math.random() * templates.connectors.length)];
    const ending = templates.endings[Math.floor(Math.random() * templates.endings.length)];

    // Generate main content based on length
    let mainContent = '';

    if (length === 'short') {
        mainContent = `Just tried ${productName} by @${brandName} and I'm obsessed! ${getRandomEmoji(emojis)}`;
    } else if (length === 'medium') {
        mainContent = `${starter} ${connector} I recently discovered ${productName} by @${brandName} and it's been a game-changer! The quality is amazing and it's perfect for ${category.toLowerCase()} enthusiasts. ${getRandomEmoji(emojis)}`;
    } else {
        mainContent = `${starter} ${connector} Let me introduce you to ${productName} by @${brandName}. I've been using it for a while now and I can honestly say it's one of the best investments I've made. The attention to detail, quality, and overall experience is exceptional. Whether you're into ${category.toLowerCase()} or just looking for something special, this is it! ${getRandomEmoji(emojis)}${getRandomEmoji(emojis)}`;
    }

    const caption = `${mainContent}\n\n${ending}`;

    return caption;
};

/**
 * Generate hashtags
 */
export const generateHashtags = (params) => {
    const {
        category = 'Lifestyle',
        count = 20,
        includeBrand = true,
        brandName = '',
        customKeywords = []
    } = params;

    const categoryHashtags = hashtagDatabase[category] || hashtagDatabase.Lifestyle;
    let hashtags = [];

    // Add brand hashtags
    if (includeBrand && brandName) {
        hashtags.push(`#${brandName.replace(/\s+/g, '')}`);
        hashtags.push(`#${brandName.replace(/\s+/g, '')}Partner`);
    }

    // Add custom keywords
    customKeywords.forEach(keyword => {
        hashtags.push(`#${keyword.replace(/\s+/g, '')}`);
    });

    // Add category hashtags
    hashtags = [...hashtags, ...categoryHashtags.primary];
    hashtags = [...hashtags, ...categoryHashtags.secondary.slice(0, 5)];
    hashtags = [...hashtags, ...categoryHashtags.trending.slice(0, 3)];

    // Add generic popular hashtags
    const popularHashtags = [
        '#InstaDaily', '#PhotoOfTheDay', '#InstaGood', '#Love', '#Instagram',
        '#Follow', '#Life', '#Amazing', '#PicOfTheDay', '#Beautiful'
    ];

    hashtags = [...hashtags, ...popularHashtags.slice(0, count - hashtags.length)];

    // Return unique hashtags up to count
    return [...new Set(hashtags)].slice(0, count);
};

/**
 * Generate content ideas
 */
export const generateContentIdeas = (params) => {
    const {
        productType = 'Product',
        category = 'Lifestyle',
        promotionType = 'Post'
    } = params;

    const ideas = {
        Post: [
            `📸 Product flatlay with lifestyle props`,
            `✨ Before & After comparison`,
            `🎨 Creative product styling`,
            `📊 Features breakdown infographic`,
            `💡 Tips & tricks carousel`,
            `🌈 Color/variant showcase`,
            `📦 Unboxing moment`,
            `⭐ User testimonials graphic`
        ],
        Story: [
            `📱 Day-in-the-life featuring product`,
            `🎬 Behind-the-scenes usage`,
            `💬 Q&A about the product`,
            `🎯 Poll: Which feature do you love?`,
            `⏱️ Quick tutorial video`,
            `🔍 Close-up product details`,
            `✅ Checklist: Why I love it`,
            `🎁 Exclusive discount code reveal`
        ],
        Reel: [
            `🎵 Trending audio product reveal`,
            `⚡ Quick transformation video`,
            `🎬 Day to night routine`,
            `💫 Product in action slow-mo`,
            `🔄 Packaging to product transition`,
            `😍 Honest review in 15 seconds`,
            `🎨 Creative product shots montage`,
            `🌟 Why I'm obsessed - storytelling`
        ],
        Video: [
            `🎥 Detailed product review (3-5 min)`,
            `📚 Step-by-step tutorial`,
            `🤔 Comparison with alternatives`,
            `💬 Personal story & experience`,
            `🎯 5 ways to use it`,
            `📦 Full unboxing experience`,
            `⭐ Pros & cons honest review`,
            `🔬 Testing different scenarios`
        ]
    };

    return ideas[promotionType] || ideas.Post;
};

/**
 * Generate posting schedule suggestions
 */
export const generatePostingSchedule = (category) => {
    const schedules = {
        Fashion: [
            { day: 'Monday', time: '7:00 PM', reason: 'Evening engagement peak' },
            { day: 'Wednesday', time: '12:00 PM', reason: 'Lunch break browsing' },
            { day: 'Friday', time: '6:00 PM', reason: 'Weekend shopping mood' }
        ],
        Beauty: [
            { day: 'Tuesday', time: '8:00 PM', reason: 'Beauty routine time' },
            { day: 'Thursday', time: '7:00 PM', reason: 'Pre-weekend prep' },
            { day: 'Sunday', time: '10:00 AM', reason: 'Self-care Sunday' }
        ],
        Food: [
            { day: 'Monday', time: '12:00 PM', reason: 'Lunch inspiration' },
            { day: 'Friday', time: '6:00 PM', reason: 'Weekend meal planning' },
            { day: 'Sunday', time: '5:00 PM', reason: 'Dinner time' }
        ],
        default: [
            { day: 'Tuesday', time: '6:00 PM', reason: 'Best engagement time' },
            { day: 'Thursday', time: '7:00 PM', reason: 'Peak activity hours' },
            { day: 'Saturday', time: '11:00 AM', reason: 'Weekend browsing' }
        ]
    };

    return schedules[category] || schedules.default;
};

// Helper function
const getRandomEmoji = (emojiArray) => {
    if (!emojiArray || emojiArray.length === 0) return '';
    return emojiArray[Math.floor(Math.random() * emojiArray.length)];
};

export default {
    generateCaption,
    generateHashtags,
    generateContentIdeas,
    generatePostingSchedule
};

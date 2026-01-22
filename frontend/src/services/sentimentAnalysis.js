/**
 * Sentiment Analysis Service
 * Analyzes comments, reviews, and brand perception
 */

// Positive and negative keyword libraries
const sentimentKeywords = {
    positive: {
        strong: ['amazing', 'excellent', 'fantastic', 'outstanding', 'brilliant', 'perfect', 'wonderful', 'awesome', 'love', 'best'],
        moderate: ['good', 'nice', 'great', 'cool', 'interesting', 'helpful', 'useful', 'quality', 'recommend', 'happy'],
        mild: ['ok', 'fine', 'decent', 'alright', 'acceptable', 'fair', 'reasonable', 'satisfactory']
    },
    negative: {
        strong: ['terrible', 'awful', 'horrible', 'worst', 'hate', 'disgusting', 'pathetic', 'useless', 'garbage', 'scam'],
        moderate: ['bad', 'poor', 'disappointing', 'mediocre', 'overpriced', 'waste', 'issue', 'problem', 'concern'],
        mild: ['meh', 'not great', 'could be better', 'average', 'nothing special', 'okay']
    },
    neutral: ['product', 'brand', 'item', 'thing', 'stuff', 'maybe', 'perhaps', 'unsure']
};

const emojiSentiments = {
    positive: ['😊', '😄', '😃', '🙂', '😁', '🥰', '😍', '❤️', '💕', '👍', '👏', '🎉', '✨', '🌟', '💯', '🔥'],
    negative: ['😞', '😢', '😭', '😠', '😡', '👎', '💔'],
    neutral: ['🤔', '😐', '😑']
};

/**
 * Analyze sentiment of a single comment/review
 */
export const analyzeSentiment = (text) => {
    if (!text || typeof text !== 'string') {
        return { sentiment: 'neutral', score: 0, confidence: 0 };
    }

    const lowerText = text.toLowerCase();
    let score = 0;
    let positiveCount = 0;
    let negativeCount = 0;

    // Check for positive keywords
    Object.entries(sentimentKeywords.positive).forEach(([intensity, words]) => {
        words.forEach(word => {
            if (lowerText.includes(word)) {
                const weight = intensity === 'strong' ? 3 : intensity === 'moderate' ? 2 : 1;
                score += weight;
                positiveCount++;
            }
        });
    });

    // Check for negative keywords
    Object.entries(sentimentKeywords.negative).forEach(([intensity, words]) => {
        words.forEach(word => {
            if (lowerText.includes(word)) {
                const weight = intensity === 'strong' ? 3 : intensity === 'moderate' ? 2 : 1;
                score -= weight;
                negativeCount++;
            }
        });
    });

    // Check for emojis
    emojiSentiments.positive.forEach(emoji => {
        if (text.includes(emoji)) score += 1;
    });

    emojiSentiments.negative.forEach(emoji => {
        if (text.includes(emoji)) score -= 1;
    });

    // Determine sentiment
    let sentiment = 'neutral';
    if (score > 2) sentiment = 'positive';
    else if (score < -2) sentiment = 'negative';

    // Calculate confidence (0-100)
    const totalKeywords = positiveCount + negativeCount;
    const confidence = Math.min(100, totalKeywords * 15);

    return {
        sentiment,
        score,
        confidence,
        breakdown: {
            positiveKeywords: positiveCount,
            negativeKeywords: negativeCount
        }
    };
};

/**
 * Analyze sentiment of multiple comments
 */
export const analyzeBulkSentiment = (comments) => {
    if (!Array.isArray(comments) || comments.length === 0) {
        return {
            overall: 'neutral',
            breakdown: { positive: 0, negative: 0, neutral: 0 },
            details: []
        };
    }

    const analyzed = comments.map(comment => ({
        text: comment.text || comment,
        ...analyzeSentiment(comment.text || comment),
        timestamp: comment.timestamp || new Date()
    }));

    const positive = analyzed.filter(a => a.sentiment === 'positive').length;
    const negative = analyzed.filter(a => a.sentiment === 'negative').length;
    const neutral = analyzed.filter(a => a.sentiment === 'neutral').length;

    const total = comments.length;
    const positivePercent = (positive / total) * 100;
    const negativePercent = (negative / total) * 100;

    let overall = 'neutral';
    if (positivePercent > 60) overall = 'positive';
    else if (negativePercent > 40) overall = 'negative';

    return {
        overall,
        breakdown: {
            positive,
            negative,
            neutral,
            positivePercent: Math.round(positivePercent),
            negativePercent: Math.round(negativePercent),
            neutralPercent: Math.round((neutral / total) * 100)
        },
        totalComments: total,
        details: analyzed,
        sentimentScore: analyzed.reduce((sum, a) => sum + a.score, 0) / total
    };
};

/**
 * Analyze brand perception over time
 */
export const analyzeBrandPerception = (historicalComments) => {
    if (!Array.isArray(historicalComments) || historicalComments.length === 0) {
        return {
            trend: 'stable',
            currentSentiment: 'neutral',
            change: 0
        };
    }

    // Sort by timestamp
    const sorted = historicalComments.sort((a, b) =>
        new Date(a.timestamp) - new Date(b.timestamp)
    );

    // Divide into periods
    const halfPoint = Math.floor(sorted.length / 2);
    const earlier = sorted.slice(0, halfPoint);
    const recent = sorted.slice(halfPoint);

    const earlierAnalysis = analyzeBulkSentiment(earlier);
    const recentAnalysis = analyzeBulkSentiment(recent);

    const change = recentAnalysis.sentimentScore - earlierAnalysis.sentimentScore;

    let trend = 'stable';
    if (change > 1) trend = 'improving';
    else if (change < -1) trend = 'declining';

    return {
        trend,
        currentSentiment: recentAnalysis.overall,
        previousSentiment: earlierAnalysis.overall,
        change: Math.round(change * 10) / 10,
        current: recentAnalysis,
        previous: earlierAnalysis,
        recommendation: getTrendRecommendation(trend, recentAnalysis.overall)
    };
};

/**
 * Extract key topics from comments
 */
export const extractTopics = (comments) => {
    const commonWords = ['the', 'a', 'an', 'is', 'it', 'to', 'and', 'of', 'in', 'on', 'for', 'with'];
    const wordFrequency = {};

    comments.forEach(comment => {
        const text = (comment.text || comment).toLowerCase();
        const words = text.split(/\s+/).filter(word =>
            word.length > 3 && !commonWords.includes(word)
        );

        words.forEach(word => {
            wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        });
    });

    // Get top 10 topics
    const topics = Object.entries(wordFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word, count]) => ({
            topic: word,
            mentions: count,
            relevance: Math.min(100, (count / comments.length) * 100)
        }));

    return topics;
};

/**
 * Identify pain points from negative feedback
 */
export const identifyPainPoints = (comments) => {
    const negativeComments = comments.filter(comment => {
        const analysis = analyzeSentiment(comment.text || comment);
        return analysis.sentiment === 'negative';
    });

    const painPointKeywords = {
        'price': ['expensive', 'overpriced', 'costly', 'price', 'cost'],
        'quality': ['poor quality', 'bad quality', 'cheap', 'broke', 'broken'],
        'delivery': ['late', 'delay', 'shipping', 'delivery', 'arrived'],
        'service': ['support', 'customer service', 'help', 'response', 'reply'],
        'product': ['defective', 'not working', 'issue', 'problem', 'fault']
    };

    const painPoints = {};

    Object.entries(painPointKeywords).forEach(([category, keywords]) => {
        const mentions = negativeComments.filter(comment => {
            const text = (comment.text || comment).toLowerCase();
            return keywords.some(keyword => text.includes(keyword));
        }).length;

        if (mentions > 0) {
            painPoints[category] = {
                count: mentions,
                percentage: Math.round((mentions / negativeComments.length) * 100)
            };
        }
    });

    return {
        totalNegative: negativeComments.length,
        painPoints: Object.entries(painPoints)
            .sort((a, b) => b[1].count - a[1].count)
            .map(([category, data]) => ({
                category,
                ...data
            }))
    };
};

/**
 * Generate engagement quality score
 */
export const calculateEngagementQuality = (comments) => {
    if (!comments || comments.length === 0) {
        return { score: 0, quality: 'N/A' };
    }

    let qualityScore = 50; // Base score

    const sentimentAnalysis = analyzeBulkSentiment(comments);

    // Positive sentiment adds to quality
    qualityScore += sentimentAnalysis.breakdown.positivePercent * 0.3;

    // Negative sentiment reduces quality
    qualityScore -= sentimentAnalysis.breakdown.negativePercent * 0.5;

    // Long comments indicate high engagement
    const avgLength = comments.reduce((sum, c) =>
        sum + (c.text || c).length, 0
    ) / comments.length;

    if (avgLength > 50) qualityScore += 10;
    else if (avgLength < 20) qualityScore -= 5;

    // Cap score between 0 and 100
    qualityScore = Math.max(0, Math.min(100, qualityScore));

    let quality = 'Average';
    if (qualityScore >= 80) quality = 'Excellent';
    else if (qualityScore >= 60) quality = 'Good';
    else if (qualityScore < 40) quality = 'Poor';

    return {
        score: Math.round(qualityScore),
        quality,
        factors: {
            sentiment: sentimentAnalysis.overall,
            avgCommentLength: Math.round(avgLength),
            totalComments: comments.length
        }
    };
};

/**
 * Generate sentiment report
 */
export const generateSentimentReport = (data) => {
    const {
        comments = [],
        campaignName = 'Campaign',
        timeRange = '7 days'
    } = data;

    const bulkAnalysis = analyzeBulkSentiment(comments);
    const topics = extractTopics(comments);
    const painPoints = identifyPainPoints(comments);
    const engagementQuality = calculateEngagementQuality(comments);

    return {
        campaignName,
        timeRange,
        generatedAt: new Date().toISOString(),
        summary: {
            ...bulkAnalysis,
            engagementQuality
        },
        topics,
        painPoints,
        recommendations: generateRecommendations(bulkAnalysis, painPoints)
    };
};

// Helper Functions

function getTrendRecommendation(trend, currentSentiment) {
    if (trend === 'improving' && currentSentiment === 'positive') {
        return 'Excellent! Keep up the current strategy and scale up investment.';
    } else if (trend === 'improving') {
        return 'Positive momentum! Continue current approach to maintain growth.';
    } else if (trend === 'declining' && currentSentiment === 'negative') {
        return 'Urgent: Address negative feedback and review campaign strategy immediately.';
    } else if (trend === 'declining') {
        return 'Warning: Monitor closely and consider adjusting approach to reverse trend.';
    } else {
        return 'Stable performance. Consider A/B testing to optimize results.';
    }
}

function generateRecommendations(sentimentAnalysis, painPoints) {
    const recommendations = [];

    if (sentimentAnalysis.breakdown.negativePercent > 30) {
        recommendations.push({
            priority: 'high',
            category: 'Sentiment',
            action: 'Address negative feedback immediately',
            impact: 'Prevent brand damage and improve perception'
        });
    }

    if (painPoints.painPoints.length > 0) {
        const topPainPoint = painPoints.painPoints[0];
        recommendations.push({
            priority: 'high',
            category: topPainPoint.category,
            action: `Focus on improving ${topPainPoint.category} - mentioned in ${topPainPoint.percentage}% of negative comments`,
            impact: 'Reduce negative sentiment significantly'
        });
    }

    if (sentimentAnalysis.breakdown.positivePercent > 60) {
        recommendations.push({
            priority: 'medium',
            category: 'Amplification',
            action: 'Leverage positive sentiment by encouraging reviews and testimonials',
            impact: 'Build social proof and attract more customers'
        });
    }

    return recommendations;
}

export default {
    analyzeSentiment,
    analyzeBulkSentiment,
    analyzeBrandPerception,
    extractTopics,
    identifyPainPoints,
    calculateEngagementQuality,
    generateSentimentReport
};

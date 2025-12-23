import { motion } from 'framer-motion';
import { HiSparkles, HiLightningBolt, HiStar, HiCheckCircle } from 'react-icons/hi';

const InsightsCard = ({ insights }) => {
    if (!insights) return null;

    const getQualityColor = (quality) => {
        switch (quality) {
            case 'High': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
            case 'Medium': return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
            case 'Low': return 'text-red-400 bg-red-500/20 border-red-500/30';
            default: return 'text-dark-400 bg-dark-600 border-dark-500';
        }
    };

    const scorePercentage = insights.score || 0;

    return (
        <motion.div
            className="glass-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex items-center mb-6">
                <HiSparkles className="text-primary-400 text-2xl mr-2" />
                <h3 className="text-lg font-semibold text-dark-100">AI Profile Insights</h3>
            </div>

            {/* Score Ring */}
            <div className="flex items-center justify-center mb-6">
                <div className="relative w-32 h-32">
                    {/* Background circle */}
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="64"
                            cy="64"
                            r="56"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            className="text-dark-700"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="64"
                            cy="64"
                            r="56"
                            fill="none"
                            strokeWidth="8"
                            strokeLinecap="round"
                            className="text-primary-500"
                            strokeDasharray={`${scorePercentage * 3.52} 352`}
                            style={{
                                transition: 'stroke-dasharray 1s ease-out'
                            }}
                        />
                    </svg>
                    {/* Score text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-dark-100">{scorePercentage}</span>
                        <span className="text-xs text-dark-400">Profile Score</span>
                    </div>
                </div>
            </div>

            {/* Quality Badges */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                    <div className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-medium border ${getQualityColor(insights.engagementQuality)}`}>
                        <HiLightningBolt className="mr-1" />
                        {insights.engagementQuality}
                    </div>
                    <p className="text-xs text-dark-400 mt-1">Engagement Quality</p>
                </div>
                <div className="text-center">
                    <div className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-medium border ${getQualityColor(insights.audienceAuthenticity)}`}>
                        <HiCheckCircle className="mr-1" />
                        {insights.audienceAuthenticity}
                    </div>
                    <p className="text-xs text-dark-400 mt-1">Audience Authenticity</p>
                </div>
            </div>

            {/* Strengths */}
            {insights.strengths && insights.strengths.length > 0 && (
                <div className="mb-6">
                    <h4 className="text-sm font-medium text-dark-300 mb-3 flex items-center">
                        <HiStar className="mr-1 text-amber-400" />
                        Your Strengths
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {insights.strengths.map((strength, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-dark-700 text-dark-200 text-xs rounded-full border border-dark-600"
                            >
                                {strength}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Profile Summary */}
            {insights.profileSummary && (
                <div className="p-4 bg-dark-800/50 rounded-xl border border-dark-700">
                    <h4 className="text-sm font-medium text-dark-300 mb-2">Profile Summary</h4>
                    <p className="text-sm text-dark-400 leading-relaxed">
                        {insights.profileSummary}
                    </p>
                </div>
            )}

            {/* Last Analyzed */}
            {insights.lastAnalyzed && (
                <p className="text-xs text-dark-500 mt-4 text-center">
                    Last analyzed: {new Date(insights.lastAnalyzed).toLocaleDateString()}
                </p>
            )}
        </motion.div>
    );
};

export default InsightsCard;

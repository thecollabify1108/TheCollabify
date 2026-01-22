import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaChartLine, FaUsers, FaDollarSign, FaTrendingUp, FaFire } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { predictROI, predictEngagement, calculateSuccessProbability } from '../../services/predictiveAnalytics';

/**
 * Predictive Analytics Widgets
 * Real-time analytics with AI predictions
 */
const PredictiveAnalyticsWidget = ({ campaignData, creatorProfile }) => {
    const [roiPrediction, setRoiPrediction] = useState(null);
    const [engagementPrediction, setEngagementPrediction] = useState(null);
    const [successProbability, setSuccessProbability] = useState(null);

    useEffect(() => {
        if (campaignData) {
            const roi = predictROI(campaignData);
            const engagement = predictEngagement(creatorProfile || {});
            const success = calculateSuccessProbability(campaignData);

            setRoiPrediction(roi);
            setEngagementPrediction(engagement);
            setSuccessProbability(success);
        }
    }, [campaignData, creatorProfile]);

    if (!roiPrediction) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* ROI Prediction */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                        <FaDollarSign className="text-2xl text-green-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-dark-100">Predicted ROI</h3>
                        <p className="text-xs text-dark-500">AI Forecast</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-green-400">
                                {roiPrediction.roi > 0 ? '+' : ''}{roiPrediction.roi}%
                            </span>
                            <span className="text-sm text-dark-500">ROI</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-2 bg-dark-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                                    style={{ width: `${Math.min(roiPrediction.confidence, 100)}%` }}
                                />
                            </div>
                            <span className="text-xs text-dark-500">{roiPrediction.confidence}%</span>
                        </div>
                    </div>

                    <div className="pt-3 border-t border-dark-800">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-dark-400">Estimated Revenue</span>
                            <span className="text-dark-100 font-semibold">
                                ₹{roiPrediction.estimatedRevenue.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-dark-400">Reach</span>
                            <span className="text-dark-100 font-semibold">
                                {roiPrediction.estimatedReach.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Engagement Prediction */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                        <FaChartLine className="text-2xl text-purple-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-dark-100">Engagement</h3>
                        <p className="text-xs text-dark-500">Expected</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="text-4xl font-bold text-purple-400">
                        {engagementPrediction.totalEngagement.toLocaleString()}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-dark-400">❤️ Likes</span>
                            <span className="text-dark-100 font-semibold">
                                {engagementPrediction.breakdown.likes.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-dark-400">💬 Comments</span>
                            <span className="text-dark-100 font-semibold">
                                {engagementPrediction.breakdown.comments.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-dark-400">📤 Shares</span>
                            <span className="text-dark-100 font-semibold">
                                {engagementPrediction.breakdown.shares.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Success Probability */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`bg-gradient-to-br ${successProbability.risk === 'low'
                        ? 'from-blue-500/10 to-cyan-500/10 border-blue-500/20'
                        : successProbability.risk === 'medium'
                            ? 'from-yellow-500/10 to-orange-500/10 border-yellow-500/20'
                            : 'from-red-500/10 to-pink-500/10 border-red-500/20'
                    } border rounded-2xl p-6`}
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 ${successProbability.risk === 'low' ? 'bg-blue-500/20' :
                            successProbability.risk === 'medium' ? 'bg-yellow-500/20' :
                                'bg-red-500/20'
                        } rounded-xl flex items-center justify-center`}>
                        <FaTrendingUp className={`text-2xl ${successProbability.risk === 'low' ? 'text-blue-400' :
                                successProbability.risk === 'medium' ? 'text-yellow-400' :
                                    'text-red-400'
                            }`} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-dark-100">Success Rate</h3>
                        <p className="text-xs text-dark-500">AI Predicted</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div>
                        <div className="text-4xl font-bold text-dark-100 mb-2">
                            {successProbability.probability}%
                        </div>
                        <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${successProbability.risk === 'low' ? 'bg-blue-500/20 text-blue-400' :
                                successProbability.risk === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-red-500/20 text-red-400'
                            }`}>
                            {successProbability.risk.toUpperCase()} RISK
                        </div>
                    </div>

                    <p className="text-sm text-dark-400">
                        {successProbability.recommendation}
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default PredictiveAnalyticsWidget;

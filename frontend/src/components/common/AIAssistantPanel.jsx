import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMagic, FaTimes, FaHashtag, FaLightbulb, FaCopy, FaChevronDown, FaChevronUp, FaLock, FaChartLine } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { aiAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { canAccessMode, getUpgradePlan } from '../../config/subscriptions';
import UpgradePrompt from './UpgradePrompt';
import toast from 'react-hot-toast';

const INTELLIGENCE_MODES = [
    { id: 'match', label: 'Match Intelligence', short: 'Match', desc: 'Creator-campaign fit scoring' },
    { id: 'audit', label: 'Creator Audit', short: 'Audit', desc: 'Quality and reliability assessment' },
    { id: 'campaign', label: 'Campaign Strategy', short: 'Strategy', desc: 'Strategic planning framework' },
    { id: 'roi', label: 'ROI Forecast', short: 'ROI', desc: 'Performance prediction modeling' },
    { id: 'optimize', label: 'Optimization', short: 'Optimize', desc: 'Post-campaign improvement analysis' },
];

const OUTPUT_LABELS = {
    matchFitScore: 'Match Fit Score',
    audienceAlignmentSummary: 'Audience Alignment Summary',
    engagementReliabilityAssessment: 'Engagement Reliability Assessment',
    riskFactors: 'Risk Factors',
    suggestedCampaignAngle: 'Suggested Campaign Angle',
    confidenceLevel: 'Confidence Level',
    engagementConsistencyAnalysis: 'Engagement Consistency Analysis',
    growthStabilityOverview: 'Growth Stability Overview',
    authenticityIndicators: 'Authenticity Indicators',
    nicheAuthorityLevel: 'Niche Authority Level',
    strengths: 'Strengths',
    improvementAreas: 'Improvement Areas',
    riskIndex: 'Risk Index',
    campaignObjectiveClarification: 'Campaign Objective Clarification',
    recommendedContentFormatMix: 'Recommended Content Format Mix',
    postingFrequencyRecommendation: 'Posting Frequency Recommendation',
    kpiBenchmarks: 'KPI Benchmarks',
    budgetAllocationLogic: 'Budget Allocation Logic',
    riskAwareness: 'Risk Awareness',
    estimatedEngagementRange: 'Estimated Engagement Range',
    projectedROIBand: 'Projected ROI Band',
    riskProbability: 'Risk Probability',
    suggestedCreatorTier: 'Suggested Creator Tier',
    confidenceInterval: 'Confidence Interval',
    performanceGapAnalysis: 'Performance Gap Analysis',
    whatWorked: 'What Worked',
    whatUnderperformed: 'What Underperformed',
    recommendedAdjustments: 'Recommended Adjustments',
    strategicNextStep: 'Strategic Next Step',
};

const OUTPUT_KEYS = {
    match: ['matchFitScore', 'audienceAlignmentSummary', 'engagementReliabilityAssessment', 'riskFactors', 'suggestedCampaignAngle', 'confidenceLevel'],
    audit: ['engagementConsistencyAnalysis', 'growthStabilityOverview', 'authenticityIndicators', 'nicheAuthorityLevel', 'strengths', 'improvementAreas', 'riskIndex'],
    campaign: ['campaignObjectiveClarification', 'recommendedContentFormatMix', 'postingFrequencyRecommendation', 'kpiBenchmarks', 'budgetAllocationLogic', 'riskAwareness'],
    roi: ['estimatedEngagementRange', 'projectedROIBand', 'riskProbability', 'suggestedCreatorTier', 'confidenceInterval'],
    optimize: ['performanceGapAnalysis', 'whatWorked', 'whatUnderperformed', 'recommendedAdjustments', 'strategicNextStep'],
};

const NICHES = ['Fashion', 'Beauty', 'Tech', 'Lifestyle', 'Food', 'Travel', 'Fitness', 'Gaming', 'Education', 'Business'];
const PLATFORMS = ['Instagram', 'YouTube', 'TikTok', 'Twitter', 'LinkedIn'];
const TIERS = ['Nano (1K-10K)', 'Micro (10K-100K)', 'Mid-tier (100K-500K)', 'Macro (500K-1M)', 'Mega (1M+)'];
const GOALS = ['Brand awareness', 'Lead generation', 'Sales conversion', 'Community building', 'Content production'];

const AIAssistantPanel = ({ campaign = {}, onUse, onClose }) => {
    const { user } = useAuth();
    // Controlled mode: when onClose is provided, the parent manages visibility.
    // Stand-alone mode: the component manages its own open/close via a FAB.
    const [isOpen, setIsOpen] = useState(!!onClose);

    const handleClose = () => {
        setIsOpen(false);
        if (onClose) onClose();
    };

    const [activeTab, setActiveTab] = useState('intelligence');
    const [selectedMode, setSelectedMode] = useState(null);
    const [generatedContent, setGeneratedContent] = useState(null);
    const [modeResult, setModeResult] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [toolkitExpanded, setToolkitExpanded] = useState(false);
    const [featureManifest, setFeatureManifest] = useState(null);

    const userTier = user?.subscriptionTier || 'FREE';
    const userRole = user?.role || user?.activeRole?.toLowerCase() || 'creator';
    const upgradePlan = getUpgradePlan(userRole);

    // Load feature manifest from backend when panel opens
    useEffect(() => {
        if (isOpen && !featureManifest) {
            aiAPI.getFeatures()
                .then(res => { if (res.data.success) setFeatureManifest(res.data.data); })
                .catch(() => { }); // fail silently, use client-side canAccessMode as fallback
        }
    }, [isOpen]);
    // Daily limit checks
    const dailyRemaining = featureManifest?.dailyAILimit !== undefined ? 
        Math.max(0, featureManifest.dailyAILimit - (featureManifest.dailyAICount || 0)) : null;

    const isModeLocked = (modeId) => {
        if (!featureManifest) return !canAccessMode(userTier, modeId);
        return !featureManifest.modes?.[modeId]?.accessible;
    };

    const isModeSummary = (modeId) => {
        if (!featureManifest) return false;
        return featureManifest.modes?.[modeId]?.summaryOnly;
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const copyFullReport = () => {
        if (!modeResult) return;
        const keys = OUTPUT_KEYS[modeResult.mode] || [];
        const text = keys.map(k => `${OUTPUT_LABELS[k] || k}: ${modeResult.data[k]}`).join('\n');
        copyToClipboard(text);
    };

    const useContent = () => {
        if (generatedContent && onUse) {
            onUse(generatedContent.content);
            handleClose();
        }
    };

    const handleRunMode = async () => {
        if (!selectedMode || isGenerating) return;
        setIsGenerating(true);
        try {
            const res = await aiAPI.analyze(selectedMode, { campaign });
            if (res.data.success) {
                setModeResult({ mode: selectedMode, data: res.data.data });
                // Update feature manifest to reflect new count
                setFeatureManifest(prev => ({
                    ...prev,
                    dailyAICount: (prev?.dailyAICount || 0) + 1
                }));
            }
        } catch (err) {
            toast.error('Analysis failed. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateCaption = async () => { /* ... */ };
    const handleGenerateHashtags = async () => { /* ... */ };

    const renderModeForm = () => { /* ... */ };

    const renderModeResult = () => {
        if (!modeResult) return null;
        const keys = OUTPUT_KEYS[modeResult.mode] || [];
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-dark-100 text-sm">{INTELLIGENCE_MODES.find(m => m.id === modeResult.mode)?.label} Report</h3>
                    <button onClick={copyFullReport} className="p-2 hover:bg-dark-700 rounded-lg transition-colors" title="Copy full report"><FaCopy className="text-dark-400 text-xs" /></button>
                </div>
                {keys.map(key => {
                    const val = modeResult.data[key];
                    if (val === undefined || val === null) return null;
                    const label = OUTPUT_LABELS[key] || key;
                    return (
                        <div key={key} className="bg-dark-800/70 border border-dark-700/50 rounded-lg p-3 space-y-1">
                            <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider">{label}</h4>
                            {key === 'matchFitScore' ? (
                                <div className="flex items-center gap-3">
                                    <div className="relative w-14 h-14">
                                        <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                                            <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" className="text-dark-700" strokeWidth="3" />
                                            <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" className={val >= 70 ? 'text-green-500' : val >= 40 ? 'text-yellow-500' : 'text-red-500'} strokeWidth="3" strokeDasharray={`${val * 0.975} 100`} strokeLinecap="round" />
                                        </svg>
                                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-dark-100">{val}</span>
                                    </div>
                                    <span className={`text-sm font-medium ${val >= 70 ? 'text-green-400' : val >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>{val >= 70 ? 'Strong Fit' : val >= 40 ? 'Moderate Fit' : 'Weak Fit'}</span>
                                </div>
                            ) : Array.isArray(val) ? (
                                <ul className="space-y-1">
                                    {val.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-dark-200">
                                            <span className="text-dark-500 mt-0.5 text-xs">-</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-dark-200">{val}</p>
                            )}
                        </div>
                    );
                })}
            </motion.div>
        );
    };

    const labelCls = "block text-[10px] font-bold text-dark-500 uppercase tracking-wider mb-1.5";
    const inputCls = "w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-sm text-dark-100 focus:outline-none focus:border-purple-500/50";
    const selectCls = "w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-sm text-dark-100 focus:outline-none focus:border-purple-500/50";
    const [params, setParams] = useState({ topic: '', platform: 'Instagram', tone: 'casual', niche: 'Fashion' });

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90]" />

                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-dark-900 border-l border-dark-800 shadow-2xl z-[100] overflow-y-auto flex flex-col items-center justify-center">
                            
                            {/* Coming Soon Content */}
                            <div className="p-6 space-y-6 text-center">
                                {/* Close Button */}
                                <button onClick={handleClose} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors">
                                    <FaTimes className="text-white text-lg" />
                                </button>

                                {/* Icon */}
                                <div className="flex justify-center mb-4">
                                    <div className="w-20 h-20 rounded-full bg-indigo-950 border-2 border-indigo-500/40 flex items-center justify-center">
                                        <HiSparkles className="text-4xl text-indigo-400" />
                                    </div>
                                </div>

                                {/* Title */}
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-2">AI Intelligence Coming Soon</h2>
                                    <p className="text-dark-400 text-sm">
                                        We're currently working on powerful AI-powered intelligence tools to supercharge your campaign strategy and creator insights.
                                    </p>
                                </div>

                                {/* Features Preview */}
                                <div className="space-y-3 text-left bg-dark-800/30 border border-dark-700/50 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <FaLightbulb className="text-amber-400 text-sm mt-1 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-white">Match Intelligence</p>
                                            <p className="text-xs text-dark-400 mt-0.5">AI-powered creator-campaign fit scoring</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <FaMagic className="text-purple-400 text-sm mt-1 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-white">Campaign Strategy</p>
                                            <p className="text-xs text-dark-400 mt-0.5">Strategic planning powered by AI analysis</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <FaChartLine className="text-emerald-400 text-sm mt-1 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-white">ROI Prediction</p>
                                            <p className="text-xs text-dark-400 mt-0.5">Forecast performance and optimize budget</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Message */}
                                <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-lg p-4">
                                    <p className="text-sm text-indigo-200">
                                        Keep exploring the rest of the platform while we perfect these AI features. Check back soon!
                                    </p>
                                </div>

                                {/* Close Button */}
                                <button 
                                    onClick={handleClose}
                                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
                                >
                                    Got It
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIAssistantPanel;

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMagic, FaTimes, FaHashtag, FaLightbulb, FaCopy, FaChevronDown, FaChevronUp, FaLock } from 'react-icons/fa';
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
            {/* Floating FAB — only shown in stand-alone mode (no onClose prop) */}
            {!onClose && (
                <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setIsOpen(true)} className="fixed bottom-[calc(8.5rem+env(safe-area-inset-bottom))] right-6 z-50 w-14 h-14 bg-indigo-700 hover:bg-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white md:bottom-[calc(8rem+env(safe-area-inset-bottom))]">
                    <FaMagic className="text-xl" />
                </motion.button>
            )}

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90]" />

                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-dark-900 border-l border-dark-800 shadow-2xl z-[100] overflow-y-auto">
                            {/* Header */}
                            <div className="sticky top-0 bg-indigo-950 border-b border-indigo-800/50 p-5 z-10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <HiSparkles className="text-3xl text-white" />
                                        <div>
                                            <h2 className="text-xl font-bold text-white">Intelligence Copilot</h2>
                                            <p className="text-white/80 text-sm">Collabify Campaign Intelligence</p>
                                        </div>
                                    </div>
                                    <button onClick={handleClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                                        <FaTimes className="text-white" />
                                    </button>
                                </div>

                                <div className="flex gap-2 mt-4">
                                    {[
                                        { id: 'intelligence', label: 'Intelligence', icon: <HiSparkles /> },
                                        { id: 'toolkit', label: 'Toolkit', icon: <FaMagic /> }
                                    ].map(tab => (
                                        <button key={tab.id} onClick={() => { setActiveTab(tab.id); setModeResult(null); setGeneratedContent(null); }} className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-white/10 text-indigo-200 hover:bg-white/15'}`}>
                                            <span className="flex items-center justify-center gap-1">{tab.icon}<span className="hidden sm:inline">{tab.label}</span></span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 space-y-6">

                                {/* Intelligence Tab */}
                                {activeTab === 'intelligence' && (
                                    <div className="space-y-5">
                                        <div>
                                            <h3 className="text-sm font-semibold text-dark-200 uppercase tracking-wider">Intelligence Modes</h3>
                                            <p className="text-xs text-dark-400 mt-1">Select an analysis mode to generate structured intelligence reports.</p>
                                        </div>

                                        {/* Mode Selector */}
                                        <div className="grid grid-cols-2 gap-2">
                                            {INTELLIGENCE_MODES.map(mode => {
                                                const locked = isModeLocked(mode.id);
                                                const summary = isModeSummary(mode.id);
                                                return (
                                                    <button key={mode.id} onClick={() => { setSelectedMode(mode.id); setModeResult(null); }} className={`p-3 rounded-xl border text-left transition-all relative ${locked ? 'bg-dark-800/30 border-dark-700/30 opacity-60' : selectedMode === mode.id ? 'bg-purple-600/20 border-purple-500 ring-1 ring-purple-500/50' : 'bg-dark-800/50 border-dark-700/50 hover:border-dark-600'}`}>
                                                        <div className="flex items-center justify-between">
                                                            <span className={`text-sm font-medium ${locked ? 'text-dark-400' : selectedMode === mode.id ? 'text-purple-300' : 'text-dark-200'}`}>{mode.short}</span>
                                                            {locked && <FaLock className="text-dark-500 text-[10px]" />}
                                                            {summary && <span className="text-[9px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded font-medium">SUMMARY</span>}
                                                        </div>
                                                        <p className="text-xs text-dark-400 mt-0.5 leading-tight">{mode.desc}</p>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Daily limit indicator for FREE tier */}
                                        {dailyRemaining !== null && dailyRemaining >= 0 && (
                                            <div className="flex items-center gap-2 px-3 py-2 bg-dark-800/50 border border-dark-700/50 rounded-lg">
                                                <span className="text-xs text-dark-400">Daily queries remaining:</span>
                                                <span className={`text-xs font-semibold ${dailyRemaining === 0 ? 'text-red-400' : dailyRemaining <= 1 ? 'text-yellow-400' : 'text-green-400'}`}>{dailyRemaining}/{featureManifest?.dailyAILimit || 3}</span>
                                            </div>
                                        )}

                                        {/* Mode Form */}
                                        {selectedMode && (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                                {isModeLocked(selectedMode) ? (
                                                    <UpgradePrompt
                                                        feature={INTELLIGENCE_MODES.find(m => m.id === selectedMode)?.label}
                                                        tier={upgradePlan?.name || 'Pro'}
                                                        onUpgrade={() => toast.success(`${upgradePlan?.name || 'Pro'} upgrade coming soon!`)}
                                                    />
                                                ) : (
                                                    <>
                                                        <div className="bg-dark-800/50 border border-dark-700/50 rounded-xl p-4 space-y-3">
                                                            <h4 className="text-sm font-medium text-dark-200">{INTELLIGENCE_MODES.find(m => m.id === selectedMode)?.label} Parameters</h4>
                                                            {renderModeForm()}
                                                        </div>

                                                        {isModeSummary(selectedMode) && (
                                                            <UpgradePrompt
                                                                compact
                                                                feature={INTELLIGENCE_MODES.find(m => m.id === selectedMode)?.label}
                                                                tier={upgradePlan?.name || 'Pro'}
                                                                message={`Summary mode — upgrade to ${upgradePlan?.name || 'Pro'} for full breakdown`}
                                                                onUpgrade={() => toast.success(`${upgradePlan?.name || 'Pro'} upgrade coming soon!`)}
                                                            />
                                                        )}

                                                        <button onClick={handleRunMode} disabled={isGenerating || (dailyRemaining !== null && dailyRemaining <= 0)} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors">
                                                            {isGenerating ? 'Analyzing...' : dailyRemaining !== null && dailyRemaining <= 0 ? 'Daily Limit Reached' : 'Run Analysis'}
                                                        </button>
                                                    </>
                                                )}
                                            </motion.div>
                                        )}

                                        {/* Mode Result */}
                                        {modeResult && renderModeResult()}

                                        {/* Show upgrade message for gated (summary) results */}
                                        {modeResult?.data?._gated && (
                                            <UpgradePrompt
                                                compact
                                                feature="Full Intelligence Report"
                                                tier={upgradePlan?.name || 'Pro'}
                                                message={modeResult.data._upgradeMessage || `Upgrade to see the full breakdown`}
                                                onUpgrade={() => toast.success(`${upgradePlan?.name || 'Pro'} upgrade coming soon!`)}
                                            />
                                        )}
                                    </div>
                                )}

                                {/* Toolkit Tab */}
                                {activeTab === 'toolkit' && (
                                    <div className="space-y-5">
                                        <div>
                                            <h3 className="text-sm font-semibold text-dark-200 uppercase tracking-wider">Creator Toolkit</h3>
                                            <p className="text-xs text-dark-400 mt-1">Utility tools for content creation support.</p>
                                        </div>

                                        {/* Content Brief */}
                                        <div className="bg-dark-800/50 border border-dark-700/50 rounded-xl p-4 space-y-3">
                                            <button onClick={() => setToolkitExpanded(toolkitExpanded === 'caption' ? false : 'caption')} className="w-full flex items-center justify-between text-left">
                                                <div className="flex items-center gap-2"><FaMagic className="text-purple-400 text-xs" /><span className="text-sm font-medium text-dark-200">Content Brief</span></div>
                                                {toolkitExpanded === 'caption' ? <FaChevronUp className="text-dark-400 text-xs" /> : <FaChevronDown className="text-dark-400 text-xs" />}
                                            </button>
                                            <AnimatePresence>
                                                {toolkitExpanded === 'caption' && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-3 overflow-hidden">
                                                        <div><label className={labelCls}>Topic / Product</label><input type="text" value={params.topic} onChange={e => setParams({ ...params, topic: e.target.value })} className={inputCls} placeholder="e.g. Summer skincare collection" /></div>
                                                        <div><label className={labelCls}>Platform</label><select value={params.platform} onChange={e => setParams({ ...params, platform: e.target.value })} className={selectCls}>{PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                                                        <div>
                                                            <label className={labelCls}>Tone</label>
                                                            <div className="flex gap-2">
                                                                {['casual', 'professional', 'storytelling', 'promotional'].map(t => (
                                                                    <button key={t} onClick={() => setParams({ ...params, tone: t })} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${params.tone === t ? 'bg-purple-600 text-white' : 'bg-dark-800 text-dark-300 hover:bg-dark-700'}`}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <button onClick={handleGenerateCaption} disabled={isGenerating || !params.topic.trim()} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors">{isGenerating ? 'Generating...' : 'Generate Brief'}</button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Discovery Tags */}
                                        <div className="bg-dark-800/50 border border-dark-700/50 rounded-xl p-4 space-y-3">
                                            <button onClick={() => setToolkitExpanded(toolkitExpanded === 'hashtags' ? false : 'hashtags')} className="w-full flex items-center justify-between text-left">
                                                <div className="flex items-center gap-2"><FaHashtag className="text-purple-400 text-xs" /><span className="text-sm font-medium text-dark-200">Discovery Tags</span></div>
                                                {toolkitExpanded === 'hashtags' ? <FaChevronUp className="text-dark-400 text-xs" /> : <FaChevronDown className="text-dark-400 text-xs" />}
                                            </button>
                                            <AnimatePresence>
                                                {toolkitExpanded === 'hashtags' && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-3 overflow-hidden">
                                                        <div><label className={labelCls}>Topic</label><input type="text" value={params.topic} onChange={e => setParams({ ...params, topic: e.target.value })} className={inputCls} placeholder="e.g. Sustainable fashion" /></div>
                                                        <div><label className={labelCls}>Category</label><select value={params.niche} onChange={e => setParams({ ...params, niche: e.target.value })} className={selectCls}>{NICHES.slice(0, 7).map(n => <option key={n} value={n}>{n}</option>)}</select></div>
                                                        <button onClick={handleGenerateHashtags} disabled={isGenerating} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors">{isGenerating ? 'Generating...' : 'Generate Tags'}</button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Toolkit Generated Content */}
                                        {generatedContent && (
                                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-dark-800 border border-dark-700 rounded-xl p-4 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-semibold text-dark-100">Output</h3>
                                                    <button onClick={() => copyToClipboard(Array.isArray(generatedContent.content) ? generatedContent.content.join(' ') : generatedContent.content)} className="p-2 hover:bg-dark-700 rounded-lg transition-colors"><FaCopy className="text-dark-400" /></button>
                                                </div>
                                                <div className="text-dark-200 text-sm whitespace-pre-wrap">
                                                    {generatedContent.type === 'hashtags' && (<div className="flex flex-wrap gap-2">{generatedContent.content.map((tag, i) => (<span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded">{tag}</span>))}</div>)}
                                                    {generatedContent.type === 'caption' && (<p>{generatedContent.content}</p>)}
                                                </div>
                                                {onUse && (<button onClick={useContent} className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">Use This Content</button>)}
                                            </motion.div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIAssistantPanel;

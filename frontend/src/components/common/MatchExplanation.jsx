import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaRobot, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

/**
 * MatchExplanation Component
 * Renders structured AI explanations for matches with trust signals.
 */
const MatchExplanation = ({ explanation, isInitialExpanded = false }) => {
    const [isExpanded, setIsExpanded] = useState(isInitialExpanded);

    // Parse explanation if it's a string (JSON from backend)
    let data = explanation;
    if (typeof explanation === 'string') {
        try {
            data = JSON.parse(explanation);
        } catch (e) {
            // Fallback for legacy plain text or array
            data = {
                relevance: explanation,
                budget: "Visible pricing alignment.",
                location: "Available for target area.",
                reliability: "Establishing track record.",
                campaign: "Matches campaign format."
            };
        }
    }

    if (!data || typeof data !== 'object') return null;

    const categories = [
        { key: 'relevance', label: 'Relevance Fit', icon: <HiSparkles className="text-emerald-400" /> },
        { key: 'budget', label: 'Budget Compatibility', icon: <FaCheckCircle className="text-emerald-500/80" /> },
        { key: 'location', label: 'Location Alignment', icon: <FaCheckCircle className="text-emerald-500/80" /> },
        { key: 'reliability', label: 'Collaboration History', icon: <FaCheckCircle className="text-emerald-500/80" /> },
        { key: 'campaign', label: 'Campaign Type Match', icon: <FaCheckCircle className="text-emerald-500/80" /> }
    ];

    return (
        <div className="w-full">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-s3 bg-dark-900/40 border border-dark-700/50 rounded-premium-xl hover:bg-dark-900/60 transition-all group"
            >
                <div className="flex items-center gap-s2">
                    <FaRobot className="text-primary-400 text-sm" />
                    <span className="text-xs-pure font-bold text-dark-200 uppercase tracking-widest">AI Match Analysis</span>
                </div>
                {isExpanded ? <FaChevronUp className="text-dark-500 group-hover:text-dark-300" /> : <FaChevronDown className="text-dark-500 group-hover:text-dark-300" />}
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-s2 space-y-s2 p-s4 bg-dark-800/40 border border-dark-700/30 rounded-premium-xl">
                            {categories.map((cat) => (
                                <div key={cat.key} className="flex items-start gap-s3">
                                    <div className="mt-1 flex-shrink-0">
                                        {cat.icon}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-dark-500 uppercase tracking-tighter mb-0.5">
                                            {cat.label}
                                        </p>
                                        <p className="text-small text-dark-200 leading-tight">
                                            {data[cat.key] || "Aligned with requirements."}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {/* AI Disclaimer */}
                            <div className="pt-s2 mt-s2 border-t border-dark-700/50">
                                <p className="text-[9px] text-dark-500 italic leading-snug">
                                    🤖 Recommendations improve as collaborations complete. This analysis is objective and based on available data signals.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MatchExplanation;

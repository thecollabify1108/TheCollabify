/**
 * Reliability Score Mapping Utility (Frontend)
 * Sync with backend/services/reliabilityService.js
 */
export const getReliabilityLevel = (score) => {
    if (score >= 1.5) return { label: 'Elite', color: 'text-purple-400', icon: 'crown' };
    if (score >= 1.2) return { label: 'Reliable', color: 'text-emerald-400', icon: 'check_circle' };
    if (score >= 1.05) return { label: 'Rising Star', color: 'text-blue-400', icon: 'stars' };
    if (score < 0.9) return { label: 'Building Trust', color: 'text-amber-400', icon: 'clock' };
    return { label: 'Standard', color: 'text-dark-400', icon: 'shield' };
};

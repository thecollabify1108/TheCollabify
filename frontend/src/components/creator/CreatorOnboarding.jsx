
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaMapMarkerAlt, FaHandshake, FaRupeeSign, FaCheckCircle,
    FaArrowRight, FaArrowLeft, FaPen, FaStar, FaGlobe,
    FaInstagram, FaLink, FaBriefcase, FaChartLine, FaUsers,
    FaRocket, FaEye, FaPaperPlane
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { creatorAPI } from '../../services/api';
import { trackEvent } from '../../utils/analytics';

// ─── Constants ──────────────────────────────────────────────────
const CATEGORIES = [
    'Fashion', 'Tech', 'Fitness', 'Food', 'Travel', 'Lifestyle',
    'Beauty', 'Gaming', 'Education', 'Entertainment', 'Health',
    'Business', 'Art', 'Music', 'Sports', 'Other'
];

const COLLAB_TYPES = [
    { id: 'REMOTE', label: 'Remote', icon: '🌐', desc: 'Work from anywhere' },
    { id: 'ONSITE', label: 'On-Site', icon: '📍', desc: 'In-person shoots' },
    { id: 'HYBRID', label: 'Hybrid', icon: '🔄', desc: 'Mix of both' },
    { id: 'EVENT', label: 'Event', icon: '🎪', desc: 'Live appearances' }
];

const AVAILABILITY_OPTIONS = [
    { id: 'AVAILABLE_NOW', label: 'Available Now', color: 'emerald', icon: '🟢' },
    { id: 'LIMITED_AVAILABILITY', label: 'Limited', color: 'amber', icon: '🟡' },
    { id: 'NOT_AVAILABLE', label: 'Not Available', color: 'rose', icon: '🔴' }
];

const TRAVEL_OPTIONS = [
    { id: 'NO', label: 'Local Only', desc: 'I prefer local work' },
    { id: 'LIMITED', label: 'Nearby Cities', desc: 'I can travel to nearby areas' },
    { id: 'YES', label: 'Anywhere', desc: 'Happy to travel for work' }
];

const PHASES = [
    { label: 'Essentials', icon: FaRocket },
    { label: 'Quality Signals', icon: FaStar },
    { label: 'Preview', icon: FaEye }
];

// ─── Progress Bar ───────────────────────────────────────────────
const ProgressBar = ({ currentPhase, completionPct }) => (
    <div className="mb-8">
        {/* Phase indicators */}
        <div className="flex items-center justify-between mb-4">
            {PHASES.map((phase, i) => {
                const Icon = phase.icon;
                const isActive = i === currentPhase;
                const isDone = i < currentPhase;
                return (
                    <div key={i} className="flex items-center gap-2" style={{ flex: 1 }}>
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${isDone ? 'bg-emerald-500 text-white' :
                            isActive ? 'bg-primary-500 text-white ring-4 ring-primary-500/20' :
                                'bg-dark-700 text-dark-400'
                            }`}>
                            {isDone ? <FaCheckCircle /> : <Icon size={14} />}
                        </div>
                        <span className={`text-xs font-medium hidden sm:block ${isActive ? 'text-white' : 'text-dark-400'}`}>
                            {phase.label}
                        </span>
                        {i < PHASES.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${isDone ? 'bg-emerald-500' : 'bg-dark-700'
                                }`} />
                        )}
                    </div>
                );
            })}
        </div>
        {/* Completion bar */}
        <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
            <motion.div
                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completionPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            />
        </div>
        <p className="text-xs text-dark-400 mt-2 text-right">{completionPct}% complete</p>
    </div>
);

// ─── Phase 1: Minimal Entry ─────────────────────────────────────
const Phase1 = ({ data, setData }) => (
    <motion.div
        initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
        className="space-y-6"
    >
        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Let's get you started ✨</h2>
            <p className="text-dark-400">Just the basics — takes about 30 seconds.</p>
        </div>

        {/* Category / Niche */}
        <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">What's your content niche?</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat} type="button"
                        onClick={() => setData(d => ({ ...d, category: cat }))}
                        className={`py-2.5 px-3 rounded-xl border-2 text-xs font-medium transition-all ${data.category === cat
                            ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                            : 'border-dark-600 text-dark-300 hover:border-dark-500'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>

        {/* Primary District */}
        <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
                <FaMapMarkerAlt className="inline mr-1 text-primary-400" /> Primary District / City
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                    type="text" placeholder="District (e.g. South Delhi)"
                    value={data.location?.district || ''}
                    onChange={(e) => setData(d => ({ ...d, location: { ...d.location, district: e.target.value } }))}
                    className="input-field"
                />
                <input
                    type="text" placeholder="City (e.g. New Delhi)"
                    value={data.location?.city || ''}
                    onChange={(e) => setData(d => ({ ...d, location: { ...d.location, city: e.target.value } }))}
                    className="input-field"
                />
            </div>
        </div>

        {/* Collaboration Types */}
        <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
                <FaHandshake className="inline mr-1 text-secondary-400" /> How do you collaborate?
            </label>
            <div className="grid grid-cols-2 gap-3">
                {COLLAB_TYPES.map(type => {
                    const selected = data.collaborationTypes?.includes(type.id);
                    return (
                        <button
                            key={type.id} type="button"
                            onClick={() => {
                                const current = data.collaborationTypes || [];
                                const next = selected ? current.filter(t => t !== type.id) : [...current, type.id];
                                setData(d => ({ ...d, collaborationTypes: next }));
                            }}
                            className={`p-3 rounded-xl border-2 text-left transition-all ${selected ? 'border-purple-500 bg-purple-500/10' : 'border-dark-600 hover:border-dark-500'
                                }`}
                        >
                            <span className="text-lg">{type.icon}</span>
                            <div className={`text-sm font-medium mt-1 ${selected ? 'text-purple-400' : 'text-dark-200'}`}>{type.label}</div>
                            <div className="text-[10px] text-dark-500">{type.desc}</div>
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Charge Range */}
        <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
                <FaRupeeSign className="inline mr-1 text-emerald-400" /> Your charge range per post (₹)
            </label>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <span className="text-[10px] text-dark-500 block mb-1">Minimum</span>
                    <input
                        type="number" placeholder="e.g. 500" min="0"
                        value={data.priceRange?.min || ''}
                        onChange={(e) => setData(d => ({ ...d, priceRange: { ...d.priceRange, min: e.target.value } }))}
                        className="input-field"
                    />
                </div>
                <div>
                    <span className="text-[10px] text-dark-500 block mb-1">Maximum</span>
                    <input
                        type="number" placeholder="e.g. 5000" min="0"
                        value={data.priceRange?.max || ''}
                        onChange={(e) => setData(d => ({ ...d, priceRange: { ...d.priceRange, max: e.target.value } }))}
                        className="input-field"
                    />
                </div>
            </div>
        </div>

        {/* Availability */}
        <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">Current availability</label>
            <div className="grid grid-cols-3 gap-3">
                {AVAILABILITY_OPTIONS.map(opt => (
                    <button
                        key={opt.id} type="button"
                        onClick={() => setData(d => ({ ...d, availabilityStatus: opt.id }))}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${data.availabilityStatus === opt.id
                            ? `border-${opt.color}-500 bg-${opt.color}-500/10`
                            : 'border-dark-600 hover:border-dark-500'
                            }`}
                    >
                        <span className="text-lg">{opt.icon}</span>
                        <div className={`text-xs font-medium mt-1 ${data.availabilityStatus === opt.id ? `text-${opt.color}-400` : 'text-dark-300'
                            }`}>{opt.label}</div>
                    </button>
                ))}
            </div>
        </div>

        {/* Promotion Types (required but simple) */}
        <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">What content types do you create?</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['Reels', 'Stories', 'Posts', 'Website Visit'].map(type => {
                    const selected = data.promotionTypes?.includes(type);
                    return (
                        <button
                            key={type} type="button"
                            onClick={() => {
                                const current = data.promotionTypes || [];
                                const next = selected ? current.filter(t => t !== type) : [...current, type];
                                setData(d => ({ ...d, promotionTypes: next }));
                            }}
                            className={`py-3 rounded-xl border-2 text-sm font-medium transition-all ${selected ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                                : 'border-dark-600 text-dark-300 hover:border-dark-500'
                                }`}
                        >
                            {type}
                        </button>
                    );
                })}
            </div>
        </div>
    </motion.div>
);

// ─── Phase 2: Quality Signals ───────────────────────────────────
const Phase2 = ({ data, setData }) => {
    const addPortfolioLink = () => {
        setData(d => ({ ...d, portfolioLinks: [...(d.portfolioLinks || []), ''] }));
    };
    const updateLink = (i, val) => {
        setData(d => {
            const links = [...(d.portfolioLinks || [])];
            links[i] = val;
            return { ...d, portfolioLinks: links };
        });
    };
    const removeLink = (i) => {
        setData(d => {
            const links = [...(d.portfolioLinks || [])];
            links.splice(i, 1);
            return { ...d, portfolioLinks: links };
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            className="space-y-6"
        >
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Boost your visibility 🚀</h2>
                <p className="text-dark-400">These are optional, but completing them improves match quality.</p>
            </div>

            <div className="bg-primary-500/5 border border-primary-500/20 rounded-xl p-4 flex items-start gap-3 text-sm">
                <FaChartLine className="text-primary-400 mt-0.5 flex-shrink-0" />
                <span className="text-dark-300">Profiles with quality signals get <span className="text-primary-400 font-semibold">3× more matches</span> from brands.</span>
            </div>

            {/* Bio */}
            <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                    <FaPen className="inline mr-1 text-secondary-400" /> Bio — tell brands about you
                </label>
                <textarea
                    value={data.bio || ''}
                    onChange={(e) => setData(d => ({ ...d, bio: e.target.value }))}
                    placeholder="I'm a lifestyle content creator based in Mumbai, specializing in food and travel content..."
                    className="input-field h-24 resize-none"
                    maxLength={500}
                />
                <p className="text-[10px] text-dark-500 mt-1">{(data.bio || '').length}/500</p>
            </div>

            {/* Audience stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-dark-200 mb-2">
                        <FaUsers className="inline mr-1 text-blue-400" /> Follower Count
                    </label>
                    <input
                        type="number" placeholder="e.g. 15000" min="0"
                        value={data.followerCount || ''}
                        onChange={(e) => setData(d => ({ ...d, followerCount: e.target.value }))}
                        className="input-field"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-dark-200 mb-2">
                        <FaChartLine className="inline mr-1 text-emerald-400" /> Engagement Rate (%)
                    </label>
                    <input
                        type="number" placeholder="e.g. 4.5" min="0" max="100" step="0.1"
                        value={data.engagementRate || ''}
                        onChange={(e) => setData(d => ({ ...d, engagementRate: e.target.value }))}
                        className="input-field"
                    />
                </div>
            </div>

            {/* Portfolio Links */}
            <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                    <FaLink className="inline mr-1 text-cyan-400" /> Portfolio Links
                </label>
                <div className="space-y-2">
                    {(data.portfolioLinks || []).map((link, i) => (
                        <div key={i} className="flex gap-2">
                            <input
                                type="url" placeholder="https://..."
                                value={link} onChange={(e) => updateLink(i, e.target.value)}
                                className="input-field flex-1"
                            />
                            <button type="button" onClick={() => removeLink(i)}
                                className="px-3 text-dark-400 hover:text-rose-400 transition">✕</button>
                        </div>
                    ))}
                    <button type="button" onClick={addPortfolioLink}
                        className="w-full py-2.5 border-2 border-dashed border-dark-600 rounded-xl text-dark-400 hover:border-dark-500 hover:text-dark-300 text-sm transition">
                        + Add Link
                    </button>
                </div>
            </div>

            {/* Travel Willingness */}
            <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                    <FaGlobe className="inline mr-1 text-amber-400" /> Willing to travel?
                </label>
                <div className="grid grid-cols-3 gap-3">
                    {TRAVEL_OPTIONS.map(opt => (
                        <button
                            key={opt.id} type="button"
                            onClick={() => setData(d => ({ ...d, willingToTravel: opt.id }))}
                            className={`p-3 rounded-xl border-2 transition-all text-left ${data.willingToTravel === opt.id
                                ? 'border-amber-500 bg-amber-500/10'
                                : 'border-dark-600 hover:border-dark-500'
                                }`}
                        >
                            <div className={`text-sm font-medium ${data.willingToTravel === opt.id ? 'text-amber-400' : 'text-dark-200'}`}>{opt.label}</div>
                            <div className="text-[10px] text-dark-500 mt-0.5">{opt.desc}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Past Experience */}
            <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                    <FaBriefcase className="inline mr-1 text-indigo-400" /> Past collaboration experience
                </label>
                <textarea
                    value={data.pastExperience || ''}
                    onChange={(e) => setData(d => ({ ...d, pastExperience: e.target.value }))}
                    placeholder="I've worked with brands like X, Y for Instagram campaigns..."
                    className="input-field h-20 resize-none"
                    maxLength={500}
                />
            </div>

            {/* Instagram */}
            <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                    <FaInstagram className="inline mr-1 text-pink-400" /> Instagram Profile URL
                </label>
                <input
                    type="url" placeholder="https://instagram.com/your_username"
                    value={data.instagramProfileUrl || ''}
                    onChange={(e) => setData(d => ({ ...d, instagramProfileUrl: e.target.value }))}
                    className="input-field"
                />
            </div>
        </motion.div>
    );
};

// ─── Phase 3: Preview ───────────────────────────────────────────
const Phase3 = ({ data, completionPct }) => {
    const matchReasons = [];
    if (data.category) matchReasons.push(`Specializes in ${data.category} content`);
    if (data.collaborationTypes?.length > 0) matchReasons.push(`Open to ${data.collaborationTypes.map(t => t.toLowerCase()).join(', ')} work`);
    if (data.priceRange?.min && data.priceRange?.max) matchReasons.push(`Budget range ₹${data.priceRange.min}–₹${data.priceRange.max}`);
    if (data.location?.district) matchReasons.push(`Based in ${data.location.district}`);
    if (data.willingToTravel === 'YES') matchReasons.push('Willing to travel anywhere');
    if (data.followerCount > 0) matchReasons.push(`${Number(data.followerCount).toLocaleString()} followers`);
    if (data.bio) matchReasons.push('Has a detailed bio');

    return (
        <motion.div
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            className="space-y-6"
        >
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Your profile preview 👀</h2>
                <p className="text-dark-400">This is how brands will discover you.</p>
            </div>

            {/* Profile Card Preview */}
            <div className="glass-card p-6 border border-dark-600 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-xl font-bold">
                        {(data.category || 'C')[0]}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-white">{data.category || 'Creator'} Creator</h3>
                        <p className="text-dark-400 text-sm flex items-center gap-1">
                            <FaMapMarkerAlt size={10} /> {data.location?.district || data.location?.city || 'Location not set'}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-dark-400">Completion</div>
                        <div className={`text-lg font-bold ${completionPct >= 80 ? 'text-emerald-400' : completionPct >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                            {completionPct}%
                        </div>
                    </div>
                </div>

                {data.bio && (
                    <p className="text-dark-300 text-sm mb-4 line-clamp-2">{data.bio}</p>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                    {data.promotionTypes?.map(t => (
                        <span key={t} className="px-2.5 py-1 bg-primary-500/10 text-primary-400 text-xs rounded-full font-medium">{t}</span>
                    ))}
                    {data.collaborationTypes?.map(t => (
                        <span key={t} className="px-2.5 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-full font-medium">{t}</span>
                    ))}
                </div>

                {data.priceRange?.min && (
                    <div className="flex items-center gap-2 text-sm text-dark-300">
                        <FaRupeeSign className="text-emerald-400" size={12} />
                        ₹{Number(data.priceRange.min).toLocaleString()} – ₹{Number(data.priceRange.max).toLocaleString()} per post
                    </div>
                )}
            </div>

            {/* Why brands may match */}
            <div className="glass-card p-5 border border-emerald-500/20 bg-emerald-500/5">
                <h4 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
                    <FaStar /> Why brands may match with you
                </h4>
                <ul className="space-y-2">
                    {matchReasons.map((reason, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-dark-300">
                            <FaCheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0" size={12} />
                            {reason}
                        </li>
                    ))}
                    {matchReasons.length === 0 && (
                        <li className="text-sm text-dark-500 italic">Complete more fields to see match reasons.</li>
                    )}
                </ul>
            </div>

            {completionPct < 100 && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 text-sm text-dark-300">
                    💡 <span className="text-amber-400 font-medium">Tip:</span> Go back and fill in the optional fields to reach 100% — it significantly improves your match quality.
                </div>
            )}
        </motion.div>
    );
};

// ─── Main Component ─────────────────────────────────────────────
const CreatorOnboarding = ({ onComplete }) => {
    const [phase, setPhase] = useState(0);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState({
        category: '',
        promotionTypes: [],
        priceRange: { min: '', max: '' },
        availabilityStatus: 'AVAILABLE_NOW',
        collaborationTypes: ['REMOTE'],
        location: { district: '', city: '', state: '' },
        // Phase 2
        bio: '',
        followerCount: '',
        engagementRate: '',
        portfolioLinks: [],
        willingToTravel: 'NO',
        pastExperience: '',
        instagramProfileUrl: ''
    });

    // Calculate live completion percentage
    const calculateLocalCompletion = () => {
        let score = 0;
        if (data.category) score += 10;
        if (data.promotionTypes?.length > 0) score += 10;
        if (data.priceRange?.min && data.priceRange?.max) score += 10;
        if (data.availabilityStatus) score += 10;
        if (data.collaborationTypes?.length > 0) score += 10;
        if (data.location?.district || data.location?.city) score += 10;
        if (data.bio?.trim().length > 10) score += 8;
        if (parseInt(data.followerCount) > 0) score += 8;
        if (parseFloat(data.engagementRate) > 0) score += 8;
        if (data.portfolioLinks?.filter(l => l.trim()).length > 0) score += 8;
        if (data.willingToTravel && data.willingToTravel !== 'NO') score += 8;
        return Math.min(100, score);
    };

    const completionPct = calculateLocalCompletion();

    const validatePhase1 = () => {
        if (!data.category) { toast.error('Please select your content niche'); return false; }
        if (!data.promotionTypes || data.promotionTypes.length === 0) { toast.error('Select at least one content type'); return false; }
        if (!data.priceRange?.min || !data.priceRange?.max) { toast.error('Enter your charge range'); return false; }
        if (parseFloat(data.priceRange.min) > parseFloat(data.priceRange.max)) { toast.error('Max price must be ≥ min price'); return false; }
        return true;
    };

    const saveToServer = async () => {
        setSaving(true);
        try {
            const payload = {
                category: data.category,
                promotionTypes: data.promotionTypes,
                priceRange: {
                    min: parseFloat(data.priceRange.min),
                    max: parseFloat(data.priceRange.max)
                },
                availabilityStatus: data.availabilityStatus,
                collaborationTypes: data.collaborationTypes,
                location: data.location,
                isAvailable: data.availabilityStatus !== 'NOT_AVAILABLE'
            };

            // Phase 2 fields (only if filled)
            if (data.bio?.trim()) payload.bio = data.bio.trim();
            if (parseInt(data.followerCount) > 0) payload.followerCount = parseInt(data.followerCount);
            if (parseFloat(data.engagementRate) > 0) payload.engagementRate = parseFloat(data.engagementRate);
            if (data.portfolioLinks?.filter(l => l.trim()).length > 0) payload.portfolioLinks = data.portfolioLinks.filter(l => l.trim());
            if (data.willingToTravel) payload.willingToTravel = data.willingToTravel;
            if (data.pastExperience?.trim()) payload.pastExperience = data.pastExperience.trim();
            if (data.instagramProfileUrl?.trim()) payload.instagramProfileUrl = data.instagramProfileUrl.trim();

            const res = await creatorAPI.createProfile(payload);
            return res.data.data.profile;
        } catch (error) {
            // If profile already exists, update instead
            if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
                const payload = {
                    category: data.category,
                    promotionTypes: data.promotionTypes,
                    priceRange: { min: parseFloat(data.priceRange.min), max: parseFloat(data.priceRange.max) },
                    availabilityStatus: data.availabilityStatus,
                    collaborationTypes: data.collaborationTypes,
                    location: data.location,
                    bio: data.bio?.trim() || '',
                    willingToTravel: data.willingToTravel,
                    pastExperience: data.pastExperience?.trim() || '',
                    instagramProfileUrl: data.instagramProfileUrl?.trim() || ''
                };
                if (parseInt(data.followerCount) > 0) payload.followerCount = parseInt(data.followerCount);
                if (parseFloat(data.engagementRate) > 0) payload.engagementRate = parseFloat(data.engagementRate);
                if (data.portfolioLinks?.filter(l => l.trim()).length > 0) payload.portfolioLinks = data.portfolioLinks.filter(l => l.trim());

                const res = await creatorAPI.updateProfile(payload);
                return res.data.data.profile;
            }
            throw error;
        } finally {
            setSaving(false);
        }
    };

    const handleNext = async () => {
        if (phase === 0) {
            if (!validatePhase1()) return;
            // Save Phase 1 to server
            try {
                await saveToServer();
                toast.success(`Profile created! ${completionPct}% complete`);
                setPhase(1);
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to save');
            }
        } else if (phase === 1) {
            // Save Phase 2 updates
            try {
                await saveToServer();
                toast.success('Quality signals saved!');
                setPhase(2);
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to save');
            }
        }
    };

    const handleFinish = async () => {
        try {
            const profile = await saveToServer();
            trackEvent('onboarding_completed');
            toast.success('🎉 Profile ready! Welcome aboard.');
            if (onComplete) onComplete(profile);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to finish');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-lg">
                <ProgressBar currentPhase={phase} completionPct={completionPct} />

                <div className="glass-card p-6 sm:p-8">
                    <AnimatePresence mode="wait">
                        {phase === 0 && <Phase1 key="p1" data={data} setData={setData} />}
                        {phase === 1 && <Phase2 key="p2" data={data} setData={setData} />}
                        {phase === 2 && <Phase3 key="p3" data={data} completionPct={completionPct} />}
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-dark-700">
                        {phase > 0 ? (
                            <button onClick={() => setPhase(p => p - 1)}
                                className="flex items-center gap-2 text-dark-400 hover:text-white transition text-sm">
                                <FaArrowLeft size={12} /> Back
                            </button>
                        ) : <div />}

                        {phase < 2 ? (
                            <button
                                onClick={handleNext} disabled={saving}
                                className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold disabled:opacity-50"
                            >
                                {saving ? (
                                    <span className="flex items-center gap-2"><span className="animate-spin">⌛</span> Saving...</span>
                                ) : (
                                    <>{phase === 0 ? 'Continue' : 'Save & Preview'} <FaArrowRight size={12} /></>
                                )}
                            </button>
                        ) : (
                            <div className="flex gap-3">
                                {completionPct < 100 && (
                                    <button
                                        onClick={() => setPhase(1)}
                                        className="px-6 py-3 rounded-xl border border-dark-600 text-dark-300 hover:text-white text-sm transition"
                                    >
                                        Complete More
                                    </button>
                                )}
                                <button
                                    onClick={handleFinish} disabled={saving}
                                    className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold disabled:opacity-50"
                                >
                                    {saving ? <span className="animate-spin">⌛</span> : <FaPaperPlane size={12} />}
                                    Finish & Go to Dashboard
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Completion nudge between phases */}
                    {phase === 0 && completionPct < 60 && (
                        <p className="text-center text-[11px] text-dark-500 mt-4">
                            Fill in all fields above to reach 60% completion.
                        </p>
                    )}
                    {phase === 1 && (
                        <p className="text-center text-[11px] text-dark-500 mt-4">
                            All fields here are optional. Skip to preview anytime.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreatorOnboarding;

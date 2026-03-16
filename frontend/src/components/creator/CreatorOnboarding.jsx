
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaMapMarkerAlt, FaHandshake, FaRupeeSign, FaCheckCircle,
    FaArrowRight, FaArrowLeft, FaPen, FaStar, FaGlobe,
    FaInstagram, FaLink, FaBriefcase, FaChartLine, FaUsers,
    FaRocket, FaEye, FaPaperPlane, FaPlus, FaMinus
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { creatorAPI } from '../../services/api';
import { trackEvent } from '../../utils/analytics';
import { useAuth } from '../../context/AuthContext';

// ─── Constants ──────────────────────────────────────────────────
const CATEGORIES = [
    'Fashion', 'Tech', 'Fitness', 'Food', 'Travel', 'Lifestyle',
    'Beauty', 'Gaming', 'Education', 'Entertainment', 'Health',
    'Business', 'Art', 'Music', 'Sports', 'Other'
];

const COLLAB_TYPES = [
    { id: 'ONLINE', label: 'Online', icon: '', desc: 'Post content online' },
    { id: 'REMOTE', label: 'Remote', icon: '', desc: 'Work from anywhere' },
    { id: 'ONSITE', label: 'On-Site', icon: '', desc: 'In-person shoots' },
    { id: 'HYBRID', label: 'Hybrid', icon: '', desc: 'Mix of both' },
    { id: 'EVENT', label: 'Event', icon: '', desc: 'Live appearances' }
];

const AVAILABILITY_OPTIONS = [
    { id: 'AVAILABLE_NOW', label: 'Available Now', color: 'emerald', icon: '' },
    { id: 'LIMITED_AVAILABILITY', label: 'Limited', color: 'amber', icon: '' },
    { id: 'NOT_AVAILABLE', label: 'Not Available', color: 'rose', icon: '' }
];

const TRAVEL_OPTIONS = [
    { id: 'NO', label: 'Local Only', desc: 'I prefer local work' },
    { id: 'LIMITED', label: 'Nearby Cities', desc: 'I can travel to nearby areas' },
    { id: 'YES', label: 'Anywhere', desc: 'Happy to travel for work' }
];

const PHASES = [
    { label: 'Basics', icon: FaRocket },
    { label: 'Business', icon: FaBriefcase },
    { label: 'Signals', icon: FaPen },
    { label: 'Background', icon: FaGlobe },
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

// ─── Step 1: Basics ───────────────────────────────────────
const Step1 = ({ data, setData }) => (
    <motion.div
        initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
        className="space-y-6"
    >
        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Basics</h2>
            <p className="text-dark-400">Let's set your foundation.</p>
        </div>

        <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">What's your content niche?</label>
            <p className="text-xs text-dark-400 mb-3">Select up to 3 categories ({data.categories?.length || 0}/3)</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {CATEGORIES.map(cat => {
                    const isSelected = data.categories?.includes(cat);
                    const isMaxed = data.categories?.length >= 3 && !isSelected;
                    return (
                        <button
                            key={cat} type="button"
                            onClick={() => setData(d => {
                                const current = d.categories || [];
                                if (current.includes(cat)) {
                                    return { ...d, categories: current.filter(c => c !== cat) };
                                }
                                if (current.length >= 3) return d;
                                return { ...d, categories: [...current, cat] };
                            })}
                            disabled={isMaxed}
                            className={`py-2.5 px-3 rounded-xl border-2 text-xs font-medium transition-all ${isSelected
                                ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                                : isMaxed
                                    ? 'border-dark-700 text-dark-600 cursor-not-allowed opacity-50'
                                    : 'border-dark-600 text-dark-300 hover:border-dark-500'
                                }`}
                        >
                            {cat}
                        </button>
                    );
                })}
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
                <FaMapMarkerAlt className="inline mr-1 text-primary-400" /> Primary Location
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                    type="text" placeholder="District"
                    value={data.location?.district || ''}
                    onChange={(e) => setData(d => ({ ...d, location: { ...d.location, district: e.target.value } }))}
                    className="input-field"
                />
                <input
                    type="text" placeholder="City"
                    value={data.location?.city || ''}
                    onChange={(e) => setData(d => ({ ...d, location: { ...d.location, city: e.target.value } }))}
                    className="input-field"
                />
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
                <FaHandshake className="inline mr-1 text-secondary-400" /> Collaboration Style
            </label>
            <div className="grid grid-cols-2 gap-3">
                {COLLAB_TYPES.slice(0, 4).map(type => {
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
                            <div className={`text-sm font-medium ${selected ? 'text-purple-400' : 'text-dark-200'}`}>{type.label}</div>
                            <div className="text-[10px] text-dark-500">{type.desc}</div>
                        </button>
                    );
                })}
            </div>
        </div>
    </motion.div>
);

// ─── Step 2: Business ─────────────────────────────────────
const Step2 = ({ data, setData }) => (
    <motion.div
        initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
        className="space-y-6"
    >
        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Business Details</h2>
            <p className="text-dark-400">Set your rates and availability.</p>
        </div>

        <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
                <FaRupeeSign className="inline mr-1 text-emerald-400" /> Charge per post (₹)
            </label>
            <div className="grid grid-cols-2 gap-4">
                <input
                    type="number" placeholder="Min" min="0"
                    value={data.priceRange?.min || ''}
                    onChange={(e) => setData(d => ({ ...d, priceRange: { ...d.priceRange, min: e.target.value } }))}
                    className="input-field font-black"
                />
                <input
                    type="number" placeholder="Max" min="0"
                    value={data.priceRange?.max || ''}
                    onChange={(e) => setData(d => ({ ...d, priceRange: { ...d.priceRange, max: e.target.value } }))}
                    className="input-field font-black"
                />
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">Availability</label>
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
                        <div className={`text-xs font-medium ${data.availabilityStatus === opt.id ? `text-${opt.color}-400` : 'text-dark-300'
                            }`}>{opt.label}</div>
                    </button>
                ))}
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">Content Types</label>
            <div className="grid grid-cols-4 gap-2">
                {['Reels', 'Stories', 'Posts', 'Visits'].map(type => {
                    const selected = data.promotionTypes?.includes(type);
                    return (
                        <button
                            key={type} type="button"
                            onClick={() => {
                                const current = data.promotionTypes || [];
                                const next = selected ? current.filter(t => t !== type) : [...current, type];
                                setData(d => ({ ...d, promotionTypes: next }));
                            }}
                            className={`py-2 rounded-lg border-2 text-[10px] font-bold uppercase transition-all ${selected ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                                : 'border-dark-600 text-dark-300 hover:border-dark-500'
                                }`}
                        >
                            {type}
                        </button>
                    );
                })}
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
                <FaInstagram className="inline mr-1 text-pink-400" /> Instagram URL *
            </label>
            <input
                type="url" placeholder="https://instagram.com/..."
                value={data.instagramProfileUrl || ''}
                onChange={(e) => setData(d => ({ ...d, instagramProfileUrl: e.target.value }))}
                className="input-field"
            />
        </div>
    </motion.div>
);

// ─── Step 3: Signals ─────────────────────────────────────
const Step3 = ({ data, setData }) => (
    <motion.div
        initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
        className="space-y-6"
    >
        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Profile Signals</h2>
            <p className="text-dark-400">Deepen your authenticity markers.</p>
        </div>

        <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
                <FaPen className="inline mr-1 text-secondary-400" /> Bio
            </label>
            <textarea
                value={data.bio || ''}
                onChange={(e) => setData(d => ({ ...d, bio: e.target.value }))}
                placeholder="Share your creator journey..."
                className="input-field h-24 resize-none"
                maxLength={500}
            />
        </div>

        {/* Follower Range — RESTORED MANUAL INPUT WITH 500 DIFF */}
        <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
                <FaUsers className="inline mr-1 text-blue-400" /> Follower Range
            </label>
            <p className="text-[10px] text-emerald-400 mb-4 font-medium bg-emerald-400/5 p-3 rounded-xl border border-emerald-400/20">
                <span className="font-bold mr-1">Selection:</span> Manual input with a fixed 500 unit difference for verification.
            </p>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <span className="text-[10px] text-dark-500 block uppercase tracking-widest font-bold">Minimum</span>
                    <input
                        type="number"
                        value={data.followerRange?.min || ''}
                        onChange={(e) => {
                            const minVal = parseInt(e.target.value) || 0;
                            setData(d => ({ 
                                ...d, 
                                followerRange: { 
                                    min: minVal, 
                                    max: minVal + 500 
                                } 
                            }));
                        }}
                        placeholder="e.g. 1000"
                        className="input-field text-center font-black"
                    />
                </div>
                <div className="space-y-2">
                    <span className="text-[10px] text-dark-500 block uppercase tracking-widest font-bold">Maximum (Auto)</span>
                    <input
                        type="number"
                        value={(parseInt(data.followerRange?.min) || 0) + 500}
                        readOnly
                        className="input-field bg-dark-800/50 border-dashed text-dark-400 cursor-not-allowed text-center font-black"
                    />
                </div>
            </div>
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
    </motion.div>
);

// ─── Step 4: Background ─────────────────────────────────────
const Step4 = ({ data, setData }) => {
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
                <h2 className="text-2xl font-bold text-white mb-2">Background</h2>
                <p className="text-dark-400">Portfolio and travel preferences.</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Portfolio</label>
                <div className="space-y-2">
                    {(data.portfolioLinks || []).map((link, i) => (
                        <div key={i} className="flex gap-2">
                            <input
                                type="url" placeholder="https://..."
                                value={link} onChange={(e) => updateLink(i, e.target.value)}
                                className="input-field flex-1"
                            />
                            <button type="button" onClick={() => removeLink(i)} className="p-2 text-rose-400">✕</button>
                        </div>
                    ))}
                    <button type="button" onClick={addPortfolioLink} className="w-full py-2 border-2 border-dashed border-dark-600 rounded-xl text-dark-400 text-xs">+ Add link</button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Willing to travel?</label>
                <div className="grid grid-cols-3 gap-3">
                    {TRAVEL_OPTIONS.map(opt => (
                        <button
                            key={opt.id} type="button"
                            onClick={() => setData(d => ({ ...d, willingToTravel: opt.id }))}
                            className={`p-3 rounded-xl border-2 text-left ${data.willingToTravel === opt.id ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-dark-600 text-dark-300'}`}
                        >
                            <div className="text-xs font-bold">{opt.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Past Experience</label>
                <textarea
                    value={data.pastExperience || ''}
                    onChange={(e) => setData(d => ({ ...d, pastExperience: e.target.value }))}
                    placeholder="Brands you've worked with..."
                    className="input-field h-20 resize-none text-xs"
                />
            </div>
        </motion.div>
    );
};

// ─── Phase 3: Preview ───────────────────────────────────────────
const Phase3 = ({ data, completionPct, userName }) => {
    const matchReasons = [];
    if (data.categories?.length > 0) matchReasons.push(`Specializes in ${data.categories.join(', ')} content`);
    if (data.collaborationTypes?.length > 0) matchReasons.push(`Open to ${data.collaborationTypes.map(t => t.toLowerCase()).join(', ')} work`);
    if (data.priceRange?.min && data.priceRange?.max) matchReasons.push(`Budget range ₹${data.priceRange.min}–₹${data.priceRange.max}`);
    if (data.location?.district) matchReasons.push(`Based in ${data.location.district}`);
    if (data.willingToTravel === 'YES') matchReasons.push('Willing to travel anywhere');
    const fMin = parseInt(data.followerRange?.min);
    const fMax = parseInt(data.followerRange?.max);
    if (fMin > 0 && fMax > 0) matchReasons.push(`${fMin.toLocaleString()}–${fMax.toLocaleString()} followers`);
    if (data.instagramProfileUrl) matchReasons.push('Instagram verified link provided');
    if (data.bio) matchReasons.push('Has a detailed bio');

    return (
        <motion.div
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            className="space-y-6"
        >
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Your profile preview</h2>
                <p className="text-dark-400">This is how brands will discover you.</p>
            </div>

            {/* Profile Card Preview */}
            <div className="glass-card p-6 border border-dark-600 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-xl font-bold">
                        {(userName || 'C')[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-white">{userName || 'Creator'}</h3>
                        <p className="text-primary-400 text-xs font-medium">{data.categories?.join(' · ') || 'Creator'}</p>
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
                    <span className="text-amber-400 font-medium">Tip:</span> Go back and fill in the optional fields to reach 100% — it significantly improves your match quality.
                </div>
            )}
        </motion.div>
    );
};

// ─── Main Component ─────────────────────────────────────────────
const CreatorOnboarding = ({ onComplete }) => {
    const { user } = useAuth();
    const [step, setStep] = useState(0); // 0 to 4 (5 steps)
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState({
        categories: [],
        promotionTypes: [],
        priceRange: { min: '', max: '' },
        availabilityStatus: 'AVAILABLE_NOW',
        collaborationTypes: ['REMOTE'],
        location: { district: '', city: '', state: '' },
        instagramProfileUrl: '',
        // Signals
        bio: '',
        followerRange: { min: 1000, max: 1500 },
        engagementRate: '',
        portfolioLinks: [],
        willingToTravel: 'NO',
        pastExperience: ''
    });

    // Calculate live completion percentage
    const calculateLocalCompletion = () => {
        let score = 0;
        if (data.categories?.length > 0) score += 20;
        if (data.priceRange?.min && data.priceRange?.max) score += 20;
        if (data.instagramProfileUrl?.trim()) score += 20;
        if (data.bio?.trim().length > 10) score += 10;
        if (data.followerRange?.min > 0) score += 10;
        if (parseFloat(data.engagementRate) > 0) score += 10;
        if (data.portfolioLinks?.length > 0) score += 10;
        return Math.min(100, score);
    };

    const completionPct = calculateLocalCompletion();

    const validateStep = (s) => {
        if (s === 0) {
            if (!data.categories || data.categories.length === 0) { toast.error('Please select at least one content niche'); return false; }
            return true;
        }
        if (s === 1) {
            if (!data.priceRange?.min || !data.priceRange?.max) { toast.error('Enter your charge range'); return false; }
            if (parseFloat(data.priceRange.min) > parseFloat(data.priceRange.max)) { toast.error('Max price must be ≥ min price'); return false; }
            if (!data.instagramProfileUrl?.trim()) { toast.error('Instagram profile URL is required'); return false; }
            return true;
        }
        return true;
    };

    const buildPayload = () => {
        const payload = {
            category: data.categories?.[0] || '',
            promotionTypes: data.promotionTypes,
            priceRange: {
                min: parseFloat(data.priceRange.min),
                max: parseFloat(data.priceRange.max)
            },
            availabilityStatus: data.availabilityStatus,
            collaborationTypes: data.collaborationTypes,
            location: data.location,
            isAvailable: data.availabilityStatus !== 'NOT_AVAILABLE',
            instagramProfileUrl: data.instagramProfileUrl?.trim() || '',
            followerRange: data.followerRange // Send range object {min, max}
        };

        if (data.bio?.trim()) payload.bio = data.bio.trim();
        if (parseFloat(data.engagementRate) > 0) payload.engagementRate = parseFloat(data.engagementRate);
        if (data.portfolioLinks?.filter(l => l.trim()).length > 0) payload.portfolioLinks = data.portfolioLinks.filter(l => l.trim());
        if (data.willingToTravel) payload.willingToTravel = data.willingToTravel;
        if (data.pastExperience?.trim()) payload.pastExperience = data.pastExperience.trim();

        return payload;
    };

    const [profileExists, setProfileExists] = useState(false);

    const saveToServer = async () => {
        setSaving(true);
        try {
            const payload = buildPayload();
            let res;
            if (profileExists) {
                res = await creatorAPI.updateProfile(payload);
            } else {
                try {
                    res = await creatorAPI.createProfile(payload);
                } catch (error) {
                    if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
                        res = await creatorAPI.updateProfile(payload);
                    } else throw error;
                }
            }
            setProfileExists(true);
            return res.data.data.profile;
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Failed to save');
            throw error;
        } finally {
            setSaving(false);
        }
    };

    const handleNext = async () => {
        if (!validateStep(step)) return;
        
        // Save at intermediate steps for better UX
        if (step === 1 || step === 3) {
            try {
                await saveToServer();
                toast.success('Progress saved');
            } catch (err) { return; }
        }
        
        setStep(s => Math.min(4, s + 1));
    };

    const handleFinish = async () => {
        try {
            const profile = await saveToServer();
            trackEvent('onboarding_completed');
            toast.success('Welcome to TheCollabify!');
            if (onComplete) onComplete(profile);
        } catch (err) {}
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-dark-950/20 backdrop-blur-3xl">
            <div className="w-full max-w-lg">
                <ProgressBar currentPhase={step} completionPct={completionPct} />

                <div className="glass-card p-6 sm:p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500/20 via-indigo-500/10 to-transparent" />
                    
                    <AnimatePresence mode="wait">
                        {step === 0 && <Step1 key="s1" data={data} setData={setData} />}
                        {step === 1 && <Step2 key="s2" data={data} setData={setData} />}
                        {step === 2 && <Step3 key="s3" data={data} setData={setData} />}
                        {step === 3 && <Step4 key="s4" data={data} setData={setData} />}
                        {step === 4 && <Phase3 key="p3" data={data} completionPct={completionPct} userName={user?.name} />}
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-dark-700/50">
                        {step > 0 ? (
                            <button onClick={() => setStep(s => s - 1)}
                                className="flex items-center gap-2 text-dark-400 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest">
                                <FaArrowLeft size={10} /> Back
                            </button>
                        ) : <div />}

                        {step < 4 ? (
                            <button
                                onClick={handleNext} disabled={saving}
                                className="px-8 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-xl flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all shadow-glow disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : <>{step === 3 ? 'Preview' : 'Next'} <FaArrowRight size={10} /></>}
                            </button>
                        ) : (
                            <button
                                onClick={handleFinish} disabled={saving}
                                className="px-8 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white rounded-xl flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all shadow-glow disabled:opacity-50"
                            >
                                {saving ? 'Finalizing...' : <><FaPaperPlane size={10} /> Finish</>}
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Step indicator dot */}
                <div className="flex justify-center gap-1.5 mt-6">
                    {PHASES.map((_, i) => (
                        <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-primary-500' : 'w-1 bg-dark-700'}`} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CreatorOnboarding;

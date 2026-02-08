import { motion } from 'framer-motion';
import { FaEdit, FaInstagram, FaUserCircle, FaRupeeSign, FaStripe, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { HiUserGroup, HiLightningBolt, HiSparkles, HiCreditCard } from 'react-icons/hi';
import { paymentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ProfileCard = ({ profile, onEdit }) => {
    if (!profile) return null;

    const formatNumber = (num) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header Card */}
            <div className="glass-card p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-2xl font-bold text-dark-100 mb-2">Your Creator Profile</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary-500/10 text-primary-400 border border-primary-500/20">
                                {profile.category}
                            </span>
                            {profile.availabilityStatus === 'AVAILABLE_NOW' && (
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    ● Available Now
                                </span>
                            )}
                            {profile.availabilityStatus === 'LIMITED_AVAILABILITY' && (
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    ● Limited
                                </span>
                            )}
                            {profile.availabilityStatus === 'NOT_AVAILABLE' && (
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                    ○ Unavailable
                                </span>
                            )}
                            {!profile.availabilityStatus && (
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${profile.isAvailable
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-dark-700 text-dark-400 border border-dark-600'
                                    }`}>
                                    {profile.isAvailable ? '● Available' : 'Unavailable'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-dark-800/40 border border-dark-700/50">
                        <div className="flex items-center gap-2 mb-2">
                            <HiUserGroup className="text-blue-400" />
                            <span className="text-xs text-dark-400">Followers</span>
                        </div>
                        <div className="text-2xl font-bold text-dark-100">{formatNumber(profile.followerCount)}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-dark-800/40 border border-dark-700/50">
                        <div className="flex items-center gap-2 mb-2">
                            <HiLightningBolt className="text-amber-400" />
                            <span className="text-xs text-dark-400">Engagement</span>
                        </div>
                        <div className="text-2xl font-bold text-dark-100">{profile.engagementRate}%</div>
                    </div>
                    <div className="p-4 rounded-xl bg-dark-800/40 border border-dark-700/50">
                        <div className="flex items-center gap-2 mb-2">
                            <HiSparkles className="text-secondary-400" />
                            <span className="text-xs text-dark-400">AI Score</span>
                        </div>
                        <div className="text-2xl font-bold text-dark-100">{profile.insights?.score || 0}</div>
                    </div>
                </div>

                {/* Promotion Types */}
                <div className="mb-6">
                    <h4 className="text-sm font-semibold text-dark-300 mb-3">Promotion Types Offered</h4>
                    <div className="flex flex-wrap gap-2">
                        {profile.promotionTypes?.map(type => (
                            <span
                                key={type}
                                className="px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-400 text-sm font-medium border border-primary-500/20"
                            >
                                {type}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                    <h4 className="text-sm font-semibold text-dark-300 mb-3">Price Range</h4>
                    <div className="flex items-center gap-2 text-dark-100">
                        <FaRupeeSign className="text-emerald-400" />
                        <span className="text-lg font-bold">
                            {profile.priceRange?.min?.toLocaleString()} - ₹{profile.priceRange?.max?.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-dark-300 mb-3">Bio</h4>
                        <p className="text-dark-200 leading-relaxed">{profile.bio}</p>
                    </div>
                )}

                {/* Instagram URL */}
                {profile.instagramProfileUrl && (
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-dark-300 mb-3">Instagram Profile</h4>
                        <a
                            href={profile.instagramProfileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
                        >
                            <FaInstagram />
                            <span className="text-sm">View Profile</span>
                        </a>
                    </div>
                )}

                {/* Stripe Onboarding Section */}
                <div className="mb-6 p-4 rounded-2xl bg-dark-800/60 border border-dark-700/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                                <FaStripe size={24} />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-dark-100">Payment Verification</h4>
                                <p className="text-xs text-dark-400">Stripe Express Onboarding</p>
                            </div>
                        </div>
                        {profile.userId?.stripeOnboardingComplete ? (
                            <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                                <FaCheckCircle /> Verified
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                                <FaExclamationTriangle /> Pending
                            </span>
                        )}
                    </div>

                    {!profile.userId?.stripeOnboardingComplete ? (
                        <div className="space-y-3">
                            <p className="text-xs text-dark-300">Set up your Stripe account to receive secure escrow payments from sellers.</p>
                            <button
                                onClick={async () => {
                                    try {
                                        const res = await paymentAPI.onboard();
                                        if (res.data.success && res.data.data.url) {
                                            window.location.href = res.data.data.url;
                                        }
                                    } catch (error) {
                                        toast.error('Failed to start onboarding');
                                    }
                                }}
                                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                <HiCreditCard /> Complete Setup
                            </button>
                        </div>
                    ) : (
                        <p className="text-xs text-emerald-400/80">Your account is fully set up for secure payments.</p>
                    )}
                </div>

                {/* Edit Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onEdit}
                    className="w-full btn-3d py-4 flex items-center justify-center gap-2"
                >
                    <FaEdit />
                    Edit Profile
                </motion.button>
            </div>
        </motion.div>
    );
};

export default ProfileCard;

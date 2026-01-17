import { motion } from 'framer-motion';
import { FaEdit, FaInstagram, FaUserCircle, FaRupeeSign } from 'react-icons/fa';
import { HiUserGroup, HiLightningBolt, HiSparkles } from 'react-icons/hi';

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
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${profile.isAvailable
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-dark-700 text-dark-400 border border-dark-600'
                                }`}>
                                {profile.isAvailable ? '● Available' : 'Unavailable'}
                            </span>
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

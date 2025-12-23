import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaInstagram,
    FaUser,
    FaEdit,
    FaChartLine,
    FaBriefcase,
    FaBell,
    FaSignOutAlt,
    FaCheck,
    FaTimes,
    FaToggleOn,
    FaToggleOff,
    FaStar,
    FaDollarSign,
    FaHashtag
} from 'react-icons/fa';
import { HiSparkles, HiLightningBolt, HiUserGroup } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { creatorAPI } from '../services/api';
import toast from 'react-hot-toast';

// Components
import Navbar from '../components/common/Navbar';
import NotificationBell from '../components/common/NotificationBell';
import InsightsCard from '../components/creator/InsightsCard';
import ProfileForm from '../components/creator/ProfileForm';
import PromotionList from '../components/creator/PromotionList';

const CreatorDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [profile, setProfile] = useState(null);
    const [promotions, setPromotions] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showProfileForm, setShowProfileForm] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch profile
            try {
                const profileRes = await creatorAPI.getProfile();
                setProfile(profileRes.data.data.profile);
            } catch (error) {
                if (error.response?.status === 404) {
                    // Profile doesn't exist, show form
                    setShowProfileForm(true);
                }
            }

            // Fetch promotions
            try {
                const promotionsRes = await creatorAPI.getPromotions();
                setPromotions(promotionsRes.data.data.promotions);
            } catch (error) {
                console.error('Failed to fetch promotions:', error);
            }

            // Fetch applications
            try {
                const applicationsRes = await creatorAPI.getApplications();
                setApplications(applicationsRes.data.data.applications);
            } catch (error) {
                console.error('Failed to fetch applications:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAvailability = async () => {
        try {
            const res = await creatorAPI.updateProfile({ isAvailable: !profile.isAvailable });
            setProfile(res.data.data.profile);
            toast.success(res.data.data.profile.isAvailable ? 'You are now available!' : 'You are now unavailable');
        } catch (error) {
            toast.error('Failed to update availability');
        }
    };

    const handleApplyToPromotion = async (promotionId) => {
        try {
            await creatorAPI.applyToPromotion(promotionId);
            toast.success('Application submitted!');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to apply');
        }
    };

    const handleProfileSaved = (newProfile) => {
        setProfile(newProfile);
        setShowProfileForm(false);
        fetchData();
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <FaChartLine /> },
        { id: 'promotions', label: 'Opportunities', icon: <FaBriefcase /> },
        { id: 'applications', label: 'My Applications', icon: <FaCheck /> },
        { id: 'profile', label: 'Edit Profile', icon: <FaEdit /> }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-950 flex items-center justify-center">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary-500/30 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-950">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-dark-100 mb-2">
                            Welcome, {user?.name}! 👋
                        </h1>
                        <p className="text-dark-400">
                            {profile ? 'Manage your creator profile and discover new opportunities' : 'Complete your profile to get started'}
                        </p>
                    </div>

                    {profile && (
                        <button
                            onClick={handleToggleAvailability}
                            className={`mt-4 md:mt-0 flex items-center px-4 py-2 rounded-xl font-medium transition-all ${profile.isAvailable
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-dark-700 text-dark-300 border border-dark-600'
                                }`}
                        >
                            {profile.isAvailable ? (
                                <>
                                    <FaToggleOn className="mr-2 text-xl" />
                                    Available for Work
                                </>
                            ) : (
                                <>
                                    <FaToggleOff className="mr-2 text-xl" />
                                    Not Available
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Show profile form if no profile */}
                {showProfileForm && !profile && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <ProfileForm onSave={handleProfileSaved} />
                    </motion.div>
                )}

                {/* Main Dashboard */}
                {profile && (
                    <>
                        {/* Tabs */}
                        <div className="flex overflow-x-auto scrollbar-hide mb-8 pb-2">
                            <div className="flex space-x-2 bg-dark-800/50 p-1 rounded-xl">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                                ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white'
                                                : 'text-dark-400 hover:text-dark-200 hover:bg-dark-700'
                                            }`}
                                    >
                                        <span className="mr-2">{tab.icon}</span>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tab Content */}
                        <AnimatePresence mode="wait">
                            {activeTab === 'overview' && (
                                <motion.div
                                    key="overview"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                        <div className="glass-card p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-dark-400">Followers</span>
                                                <HiUserGroup className="text-primary-400 text-xl" />
                                            </div>
                                            <div className="text-3xl font-bold text-dark-100">
                                                {profile.followerCount >= 1000000
                                                    ? `${(profile.followerCount / 1000000).toFixed(1)}M`
                                                    : profile.followerCount >= 1000
                                                        ? `${(profile.followerCount / 1000).toFixed(1)}K`
                                                        : profile.followerCount}
                                            </div>
                                            <div className="text-sm text-dark-400 mt-1">@{profile.instagramUsername}</div>
                                        </div>

                                        <div className="glass-card p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-dark-400">Engagement Rate</span>
                                                <HiLightningBolt className="text-amber-400 text-xl" />
                                            </div>
                                            <div className="text-3xl font-bold text-dark-100">{profile.engagementRate}%</div>
                                            <div className="text-sm text-dark-400 mt-1">{profile.insights?.engagementQuality} quality</div>
                                        </div>

                                        <div className="glass-card p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-dark-400">Profile Score</span>
                                                <HiSparkles className="text-secondary-400 text-xl" />
                                            </div>
                                            <div className="text-3xl font-bold text-dark-100">{profile.insights?.score || 0}</div>
                                            <div className="text-sm text-dark-400 mt-1">out of 100</div>
                                        </div>

                                        <div className="glass-card p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-dark-400">Promotions</span>
                                                <FaBriefcase className="text-emerald-400 text-xl" />
                                            </div>
                                            <div className="text-3xl font-bold text-dark-100">{profile.successfulPromotions || 0}</div>
                                            <div className="text-sm text-dark-400 mt-1">completed</div>
                                        </div>
                                    </div>

                                    {/* Insights Card */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <InsightsCard insights={profile.insights} />

                                        {/* Quick Info */}
                                        <div className="glass-card p-6">
                                            <h3 className="text-lg font-semibold text-dark-100 mb-4">Profile Details</h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-dark-400">Category</span>
                                                    <span className="badge badge-info">{profile.category}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-dark-400">Price Range</span>
                                                    <span className="text-dark-200">
                                                        ${profile.priceRange.min} - ${profile.priceRange.max}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-dark-400">Promotion Types</span>
                                                    <div className="flex flex-wrap justify-end gap-1">
                                                        {profile.promotionTypes.map(type => (
                                                            <span key={type} className="badge badge-neutral text-xs">{type}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-dark-400">Status</span>
                                                    <span className={`badge ${profile.isAvailable ? 'badge-success' : 'badge-neutral'}`}>
                                                        {profile.isAvailable ? 'Available' : 'Unavailable'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'promotions' && (
                                <motion.div
                                    key="promotions"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    <PromotionList
                                        promotions={promotions}
                                        onApply={handleApplyToPromotion}
                                    />
                                </motion.div>
                            )}

                            {activeTab === 'applications' && (
                                <motion.div
                                    key="applications"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    <h2 className="text-xl font-semibold text-dark-100 mb-6">My Applications</h2>

                                    {applications.length === 0 ? (
                                        <div className="glass-card p-12 text-center">
                                            <FaBriefcase className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-dark-300 mb-2">No applications yet</h3>
                                            <p className="text-dark-400">Browse opportunities and apply to promotions that match your profile.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {applications.map((app, index) => (
                                                <motion.div
                                                    key={index}
                                                    className="glass-card p-6"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                >
                                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-semibold text-dark-100 mb-2">{app.promotion.title}</h3>
                                                            <p className="text-dark-400 text-sm mb-2">{app.promotion.description?.substring(0, 100)}...</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                <span className="badge badge-info">{app.promotion.promotionType}</span>
                                                                <span className="badge badge-neutral">{app.promotion.campaignGoal}</span>
                                                                <span className="text-sm text-dark-400">
                                                                    Budget: ${app.promotion.budgetRange?.min} - ${app.promotion.budgetRange?.max}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="mt-4 md:mt-0 md:ml-6">
                                                            <span className={`badge ${app.applicationStatus === 'Accepted' ? 'badge-success' :
                                                                    app.applicationStatus === 'Rejected' ? 'badge-danger' :
                                                                        'badge-warning'
                                                                }`}>
                                                                {app.applicationStatus}
                                                            </span>
                                                            <p className="text-xs text-dark-400 mt-2">
                                                                Applied: {new Date(app.appliedAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'profile' && (
                                <motion.div
                                    key="profile"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    <ProfileForm profile={profile} onSave={handleProfileSaved} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </div>
        </div>
    );
};

export default CreatorDashboard;

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaBriefcase,
    FaCheck,
    FaTrophy,
    FaComments,
    FaCog
} from 'react-icons/fa';
import { HiHome, HiSparkles, HiUserGroup, HiLightningBolt, HiViewGrid, HiChat } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { creatorAPI } from '../services/api';
import toast from 'react-hot-toast';

// Components
import Navbar from '../components/common/Navbar';
import ProfileForm from '../components/creator/ProfileForm';
import PromotionList from '../components/creator/PromotionList';
import ChatBox from '../components/common/ChatBox';
import ConversationList from '../components/common/ConversationList';
import SkeletonLoader from '../components/common/SkeletonLoader';
import OnboardingTour from '../components/common/OnboardingTour';
import CreatorAnalytics from '../components/creator/CreatorAnalytics';
import AIOpportunitySuggestions from '../components/creator/AIOpportunitySuggestions';
import ProfileProgress from '../components/creator/ProfileProgress';
import BadgeShowcase from '../components/creator/BadgeShowcase';
import ContentCreatorTips from '../components/creator/ContentCreatorTips';
import MessageRequests from '../components/creator/MessageRequests';
import ProfileCard from '../components/creator/ProfileCard';

const CreatorDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('home');
    const [profile, setProfile] = useState(null);
    const [promotions, setPromotions] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showProfileForm, setShowProfileForm] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messageSubTab, setMessageSubTab] = useState('conversations'); // 'conversations' or 'requests'
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    const [searchParams] = useSearchParams();

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam === 'edit') {
            setActiveTab('profile');
        }
    }, [searchParams]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [profileRes, promotionsRes, applicationsRes] = await Promise.allSettled([
                creatorAPI.getProfile(),
                creatorAPI.getPromotions(),
                creatorAPI.getApplications()
            ]);

            if (profileRes.status === 'fulfilled') {
                setProfile(profileRes.value.data.data.profile);
            } else if (profileRes.reason?.response?.status === 404) {
                setShowProfileForm(true);
            }

            if (promotionsRes.status === 'fulfilled') {
                setPromotions(promotionsRes.value.data.data.promotions);
            }

            if (applicationsRes.status === 'fulfilled') {
                setApplications(applicationsRes.value.data.data.applications);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSaved = () => {
        setShowProfileForm(false);
        setIsEditingProfile(false);
        fetchData();
        toast.success('Profile updated successfully!');
        // Navigate to home tab after successful save
        setActiveTab('home');
    };

    const handleApplyToPromotion = async (promotionId) => {
        try {
            await creatorAPI.applyToPromotion(promotionId);
            toast.success('Application submitted successfully!');
            fetchData();
        } catch (error) {
            toast.error(error.message || 'Failed to apply');
        }
    };

    const handleToggleAvailability = async () => {
        try {
            const updatedProfile = await creatorAPI.updateProfile({
                isAvailable: !profile.isAvailable
            });
            setProfile(updatedProfile.data.data.profile);
            toast.success(`You are now ${!profile.isAvailable ? 'available' : 'unavailable'} for work`);
        } catch (error) {
            toast.error('Failed to update availability');
        }
    };

    if (loading) {
        return <SkeletonLoader />;
    }

    const pendingApplications = applications.filter(a => a.applicationStatus === 'Pending').length;
    const completedCampaigns = profile?.successfulPromotions || 0;

    // Bottom navigation tabs
    const tabs = [
        { id: 'home', label: 'Home', icon: <HiHome /> },
        { id: 'opportunities', label: 'Browse', icon: <FaBriefcase />, badge: promotions.length },
        { id: 'applications', label: 'Applied', icon: <FaCheck />, badge: pendingApplications },
        { id: 'achievements', label: 'Badges', icon: <FaTrophy /> },
        { id: 'messages', label: 'Chat', icon: <HiChat /> },
        { id: 'profile', label: 'Profile', icon: <FaCog /> }
    ];

    return (
        <div className="min-h-screen bg-dark-950 pb-20">
            <OnboardingTour role="creator" />
            <Navbar />

            {/* Main Content */}
            <main className="max-w-lg mx-auto">
                <AnimatePresence mode="wait">
                    {/* Home Tab - Content Creator Tips */}
                    {activeTab === 'home' && (
                        <motion.div
                            key="home"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6 p-4"
                        >
                            {profile ? (
                                <>
                                    {/* Content Creator Tips */}
                                    <ContentCreatorTips />

                                    {/* Quick Stats Bar */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-4 rounded-2xl bg-dark-800/40 border border-dark-700/50">
                                            <div className="flex items-center gap-2 mb-2">
                                                <HiUserGroup className="text-blue-400" />
                                                <span className="text-xs text-dark-400">Followers</span>
                                            </div>
                                            <div className="text-2xl font-bold text-dark-100">{formatNumber(profile.followerCount)}</div>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-dark-800/40 border border-dark-700/50">
                                            <div className="flex items-center gap-2 mb-2">
                                                <HiLightningBolt className="text-amber-400" />
                                                <span className="text-xs text-dark-400">Engagement</span>
                                            </div>
                                            <div className="text-2xl font-bold text-dark-100">{profile.engagementRate}%</div>
                                        </div>
                                    </div>

                                    {/* Profile Progress */}
                                    <ProfileProgress profile={profile} onEditProfile={() => setActiveTab('profile')} />
                                </>
                            ) : (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                    <ProfileForm onSave={handleProfileSaved} />
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* Opportunities Tab */}
                    {activeTab === 'opportunities' && (
                        <motion.div
                            key="opportunities"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-4"
                        >
                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-dark-100 mb-1">Available Opportunities</h2>
                                <p className="text-sm text-dark-400">{promotions.length} brand collaborations</p>
                            </div>
                            <PromotionList promotions={promotions} onApply={handleApplyToPromotion} />
                        </motion.div>
                    )}

                    {/* Applications Tab */}
                    {activeTab === 'applications' && (
                        <motion.div
                            key="applications"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-4"
                        >
                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-dark-100 mb-1">My Applications</h2>
                                <p className="text-sm text-dark-400">{applications.length} total applications</p>
                            </div>
                            <ApplicationsView applications={applications} />
                        </motion.div>
                    )}

                    {/* Achievements Tab */}
                    {activeTab === 'achievements' && (
                        <motion.div
                            key="achievements"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-4"
                        >
                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-dark-100 mb-1">Your Achievements</h2>
                                <p className="text-sm text-dark-400">Milestones & badges earned</p>
                            </div>
                            <BadgeShowcase />
                        </motion.div>
                    )}

                    {/* Messages Tab */}
                    {activeTab === 'messages' && (
                        <motion.div
                            key="messages"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-4"
                        >
                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-dark-100 mb-3">Messages</h2>

                                {/* Sub-tabs for Messages */}
                                <div className="flex gap-2 p-1 bg-dark-800/40 rounded-lg border border-dark-700/50">
                                    <button
                                        onClick={() => setMessageSubTab('conversations')}
                                        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${messageSubTab === 'conversations'
                                            ? 'bg-primary-500 text-white'
                                            : 'text-dark-400 hover:text-dark-200'
                                            }`}
                                    >
                                        Conversations
                                    </button>
                                    <button
                                        onClick={() => setMessageSubTab('requests')}
                                        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${messageSubTab === 'requests'
                                            ? 'bg-primary-500 text-white'
                                            : 'text-dark-400 hover:text-dark-200'
                                            }`}
                                    >
                                        Requests
                                    </button>
                                </div>
                            </div>

                            {messageSubTab === 'conversations' ? (
                                <ConversationList onSelectConversation={setSelectedConversation} />
                            ) : (
                                <MessageRequests
                                    onAccept={() => {
                                        // Refresh conversations when request accepted
                                        setMessageSubTab('conversations');
                                    }}
                                    onReject={() => {
                                        // Stay on requests tab after rejection
                                    }}
                                />
                            )}
                        </motion.div>
                    )}

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-4 space-y-6"
                        >
                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-dark-100 mb-1">Profile Settings</h2>
                                <p className="text-sm text-dark-400">Manage your creator profile</p>
                            </div>

                            {/* Show ProfileCard if profile exists and not editing */}
                            {profile && !isEditingProfile ? (
                                <ProfileCard
                                    profile={profile}
                                    onEdit={() => setIsEditingProfile(true)}
                                />
                            ) : (
                                <>
                                    {/* Availability Toggle - only show when editing */}
                                    {profile && (
                                        <div className="p-4 rounded-2xl bg-dark-800/40 border border-dark-700/50">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-dark-100 mb-1">Availability Status</h3>
                                                    <p className="text-sm text-dark-400">Let brands know you're open for work</p>
                                                </div>
                                                <button
                                                    onClick={handleToggleAvailability}
                                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${profile.isAvailable
                                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                            : 'bg-dark-700 text-dark-400 border border-dark-600'
                                                        }`}
                                                >
                                                    {profile.isAvailable ? '● Available' : 'Unavailable'}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <ProfileForm profile={profile} onSave={handleProfileSaved} />
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-dark-900/95 backdrop-blur-xl border-t border-dark-800 z-50">
                <div className="max-w-lg mx-auto px-2 py-2">
                    <div className="flex items-center justify-around">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${activeTab === tab.id
                                    ? 'text-primary-400'
                                    : 'text-dark-400 hover:text-dark-200'
                                    }`}
                            >
                                <span className="text-xl">{tab.icon}</span>
                                <span className="text-xs font-medium">{tab.label}</span>
                                {tab.badge > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center font-bold">
                                        {tab.badge > 9 ? '9+' : tab.badge}
                                    </span>
                                )}
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Chat Overlay */}
            <AnimatePresence>
                {selectedConversation && (
                    <ChatBox
                        conversationId={selectedConversation._id}
                        otherUserName={selectedConversation.sellerId?.name || 'Seller'}
                        promotionTitle={selectedConversation.promotionId?.title || 'Promotion'}
                        conversation={selectedConversation}
                        onClose={() => setSelectedConversation(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// Applications View Component
const ApplicationsView = ({ applications }) => {
    if (applications.length === 0) {
        return (
            <div className="text-center py-16 px-4">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-dark-800/50 flex items-center justify-center">
                    <FaBriefcase className="w-10 h-10 text-dark-600" />
                </div>
                <h3 className="text-lg font-medium text-dark-300 mb-2">No applications yet</h3>
                <p className="text-dark-400 text-sm mb-4">Browse opportunities to get started!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {applications.map((app, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-2xl bg-dark-800/40 border border-dark-700/50"
                >
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1">
                            <h4 className="font-semibold text-dark-100 mb-1">{app.promotion.title}</h4>
                            <p className="text-sm text-dark-400 line-clamp-2">{app.promotion.description}</p>
                        </div>
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${app.applicationStatus === 'Accepted'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : app.applicationStatus === 'Rejected'
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-amber-500/20 text-amber-400'
                                }`}
                        >
                            {app.applicationStatus}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-dark-700/50 rounded text-xs text-dark-300">
                            {app.promotion.promotionType}
                        </span>
                        <span className="px-2 py-1 bg-dark-700/50 rounded text-xs text-dark-300">
                            ₹{app.promotion.budgetRange?.min} - ₹{app.promotion.budgetRange?.max}
                        </span>
                        <span className="px-2 py-1 bg-dark-700/50 rounded text-xs text-dark-400">
                            {new Date(app.appliedAt).toLocaleDateString()}
                        </span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

// Helper function
const formatNumber = num => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num;
};

export default CreatorDashboard;

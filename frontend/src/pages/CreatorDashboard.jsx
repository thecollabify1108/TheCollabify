import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaCheck,
    FaTrophy,
    FaComments,
    FaCog,
    FaCalendar,
    FaBriefcase,
    FaHandshake
} from 'react-icons/fa';
import { HiHome, HiSparkles, HiUserGroup, HiLightningBolt, HiViewGrid, HiChat, HiBriefcase } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { creatorAPI } from '../services/api';
import { trackMatchFeedback } from '../services/feedback';
import toast from 'react-hot-toast';

// Components
// Components
import DashboardLayout from '../components/layout/DashboardLayout';
// Navbar removed explicitly, using DashboardLayout instead
import ProfileForm from '../components/creator/ProfileForm';
import CreatorOnboarding from '../components/creator/CreatorOnboarding';
import PromotionList from '../components/creator/PromotionList';
import ChatBox from '../components/common/ChatBox';
import ConversationList from '../components/common/ConversationList';
import CollaborationHub from '../components/common/CollaborationHub';
import CollaborationStepper from '../components/common/CollaborationStepper';

import CreatorAnalytics from '../components/creator/CreatorAnalytics';
import { CreatorInsightCards } from '../components/analytics/InsightCards';
import AIOpportunitySuggestions from '../components/creator/AIOpportunitySuggestions';
import ProfileProgress from '../components/creator/ProfileProgress';
import BadgeShowcase from '../components/creator/BadgeShowcase';
import ContentCreatorTips from '../components/creator/ContentCreatorTips';
import MessageRequests from '../components/creator/MessageRequests';
import ProfileCard from '../components/creator/ProfileCard';
import PullToRefresh from '../components/common/PullToRefresh';
import QuickActionsFAB from '../components/common/QuickActionsFAB';
import ProfileCompletionBar from '../components/common/ProfileCompletionBar';
import { haptic } from '../utils/haptic';
import { getReliabilityLevel } from '../utils/reliability';

// NEW: Enhanced Components
import AIAssistantPanel from '../components/common/AIAssistantPanel';
import PredictiveAnalyticsWidget from '../components/analytics/PredictiveAnalyticsWidget';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';
import ContentCalendar from '../components/calendar/ContentCalendar';
import { subscriptionPlans } from '../config/subscriptions';

// Modern Dashboard Widgets
import StatCard from '../components/dashboard/StatCard';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import PerformanceChart from '../components/dashboard/PerformanceChart';
import DashboardHero from '../components/dashboard/DashboardHero';

// Enhanced UI Components
import LoadingButton from '../components/common/LoadingButton';
import EmptyState from '../components/common/EmptyState';

// Skeleton Loading Components
import { Skeleton, SkeletonStats, SkeletonCard, SkeletonList, SkeletonMobileCard } from '../components/common/Skeleton';

import GuidedAIMode from '../components/dashboard/GuidedAIMode';
import FocusWrapper from '../components/dashboard/FocusWrapper';

const CreatorDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [profile, setProfile] = useState(null);
    const [promotions, setPromotions] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const tabs = [
        { id: 'dashboard', label: 'Command', icon: <HiHome /> },
        { id: 'promotions', label: 'Intelligence', icon: <HiLightningBolt /> },
        { id: 'applications', label: 'Operations', icon: <HiBriefcase /> },
        { id: 'profile', label: 'Identity', icon: <HiSparkles /> },
        { id: 'messages', label: 'Signals', icon: <HiChat /> },
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [profileRes, promotionsRes, applicationsRes] = await Promise.allSettled([
                creatorAPI.getProfile(),
                creatorAPI.getPromotions(),
                creatorAPI.getApplications()
            ]);
            if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data.data.profile);
            if (promotionsRes.status === 'fulfilled') setPromotions(promotionsRes.value.data.data.promotions);
            if (applicationsRes.status === 'fulfilled') setApplications(applicationsRes.value.data.data.applications);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <AppLoader message="Accessing Secure Protocol..." />;

    return (
        <DashboardLayout
            user={user}
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
        >
            <div className="space-y-12">
                {/* HERO - EXECUTIVE PROFILE */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/5 pb-12">
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.5em] text-text-muted font-bold">Profile Integrity: AI_VERIFIED</span>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
                            Welcome, {user?.name || 'Authorized User'}.
                        </h1>
                        <p className="text-text-sec text-lg font-medium">Monitoring creator protocol and high-capital opportunities.</p>
                    </div>

                    <div className="flex gap-4">
                        <button className="btn-executive px-8 py-3 text-[10px] uppercase tracking-widest font-black">Generate Proposal</button>
                    </div>
                </header>

                {/* ANALYTICAL GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Network Reach', value: profile?.followerCount || '0', trend: '+12%' },
                        { label: 'Resonance Index', value: profile?.engagementRate ? `${profile.engagementRate}%` : '0%', trend: '+4.2%' },
                        { label: 'Protocol Revenue', value: '$4.2k', trend: '+18%' },
                        { label: 'Active Milestones', value: applications?.length || '0', trend: 'N/A' }
                    ].map((stat, i) => (
                        <div key={i} className="p-8 glass-card border-white/5 group hover:bg-white/[0.02] transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <span className="text-[10px] uppercase tracking-[0.4em] text-text-muted font-bold">{stat.label}</span>
                                <span className="text-[10px] text-green-500 font-black">{stat.trend}</span>
                            </div>
                            <div className="text-3xl font-black tracking-tighter text-text-prime">{stat.value}</div>
                        </div>
                    ))}
                </div>

                {/* MAIN CONTENT AREA BY TAB */}
                <div className="relative z-10">
                    {activeTab === 'dashboard' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            <div className="lg:col-span-2 space-y-12">
                                <section className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold uppercase tracking-widest">Active Intelligence</h3>
                                        <button className="text-[10px] uppercase tracking-widest font-black text-text-muted hover:text-text-prime transition">View All Signals</button>
                                    </div>
                                    <div className="grid gap-4">
                                        {promotions.slice(0, 3).map((p, i) => (
                                            <div key={i} className="p-6 border border-white/5 rounded-panel hover:bg-white/[0.02] transition-all flex justify-between items-center group">
                                                <div className="space-y-1">
                                                    <h4 className="font-bold text-text-prime group-hover:translate-x-1 transition-transform">{p.title}</h4>
                                                    <p className="text-xs text-text-muted uppercase tracking-widest font-bold">{p.category} | {p.type}</p>
                                                </div>
                                                <button className="text-[10px] px-6 py-2 border border-white/10 rounded-full font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Establish Connection</button>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            <aside className="space-y-12 bg-white/[0.01] p-8 rounded-panel border border-white/5">
                                <div className="space-y-6">
                                    <h3 className="text-[10px] uppercase tracking-[0.4em] text-text-muted font-bold">System Messages</h3>
                                    <div className="space-y-4 opacity-50 pointer-events-none">
                                        <p className="text-xs italic">No critical alerts detected in your sector.</p>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    )}

                    {activeTab === 'promotions' && <PromotionList promotions={promotions} onApply={handleApplyToPromotion} />}
                    {activeTab === 'applications' && <CollaborationHub applications={applications} />}
                    {activeTab === 'profile' && (
                        <div className="max-w-4xl">
                            <ProfileForm profile={profile} onSave={handleProfileSaved} />
                        </div>
                    )}
                    {activeTab === 'messages' && <Messages />}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CreatorDashboard;

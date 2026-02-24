import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaComments,
    FaFire,
    FaStream,
    FaUsers,
    FaTimes,
    FaArrowLeft,
    FaSearch
} from 'react-icons/fa';
import { HiSparkles, HiHome, HiUserGroup, HiChat, HiViewGrid } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { sellerAPI, chatAPI, collaborationAPI } from '../services/api';
import { trackMatchFeedback, trackMatchOutcome } from '../services/feedback';
import { trackEvent } from '../utils/analytics';
import toast from 'react-hot-toast';

// New Components
import DashboardLayout from '../components/layout/DashboardLayout';
// Navbar removed
import CampaignStories from '../components/seller/CampaignStories';
import SwipeableCreatorCard from '../components/seller/SwipeableCreatorCard';
import QuickStatsBar from '../components/seller/QuickStatsBar';
import CampaignTracker from '../components/seller/CampaignTracker';
import MessagingPanel from '../components/seller/MessagingPanel';
import CollaborationHub from '../components/common/CollaborationHub';

import CreatorSearch from '../components/seller/CreatorSearch';
import QuickActionsFAB from '../components/common/QuickActionsFAB';
import ProfileCompletionBar from '../components/common/ProfileCompletionBar';
import { haptic } from '../utils/haptic';
import { getReliabilityLevel } from '../utils/reliability';

// NEW: Enhanced Components
import EnhancedCampaignWizard from '../components/seller/EnhancedCampaignWizard';
import SmartRecommendationsPanel from '../components/seller/SmartRecommendationsPanel';
import AIAssistantPanel from '../components/common/AIAssistantPanel';
import PredictiveAnalyticsWidget from '../components/analytics/PredictiveAnalyticsWidget';
import EnhancedCreatorSearch from '../components/seller/EnhancedCreatorSearch';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';
import { BrandInsightCards } from '../components/analytics/InsightCards';
import TeamManagement from '../components/team/TeamManagement';
import { subscriptionPlans } from '../config/subscriptions';

// Modern Dashboard Widgets
import StatCard from '../components/dashboard/StatCard';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import PerformanceChart from '../components/dashboard/PerformanceChart';
import DashboardHero from '../components/dashboard/DashboardHero';

// Enhanced UI Components
import LoadingButton from '../components/common/LoadingButton';
import EmptyState from '../components/common/EmptyState';
import BottomSheet from '../components/common/BottomSheet';

// Skeleton Loading Components
import { Skeleton, SkeletonStats, SkeletonCard, SkeletonList } from '../components/common/Skeleton';

import GuidedAIMode from '../components/dashboard/GuidedAIMode';
import FocusWrapper from '../components/dashboard/FocusWrapper';

const SellerDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const tabs = [
        { id: 'dashboard', label: 'Operations', icon: <HiHome /> },
        { id: 'search', label: 'Intelligence', icon: <HiLightningBolt /> },
        { id: 'messages', label: 'Signals', icon: <HiChat /> },
        { id: 'team', label: 'Entities', icon: <HiUserGroup /> },
        { id: 'settings', label: 'Protocol', icon: <FaCog /> },
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await sellerAPI.getRequests();
            setRequests(res.data.data.requests);
        } catch (error) {
            toast.error('Protocol Data Access Failed');
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
                        <span className="text-[10px] uppercase tracking-[0.5em] text-text-muted font-bold">Institutional Account: AI_VERIFIED</span>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
                            {user?.name || 'Authorized Brand'}.
                        </h1>
                        <p className="text-text-sec text-lg font-medium">Monitoring campaign capital and creator performance vectors.</p>
                    </div>

                    <div className="flex gap-4">
                        <button className="btn-executive px-8 py-3 text-[10px] uppercase tracking-widest font-black">Initiate Campaign</button>
                    </div>
                </header>

                {/* ANALYTICAL GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Deployed Capital', value: '$12.4k', trend: '+8%' },
                        { label: 'Active Campaigns', value: requests?.length || '0', trend: '+42%' },
                        { label: 'Avg Resonance', value: '78.2%', trend: '+2.1%' },
                        { label: 'Engagement Moat', value: '4.2M', trend: 'N/A' }
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
                                        <h3 className="text-xl font-bold uppercase tracking-widest">Active Operations</h3>
                                        <button className="text-[10px] uppercase tracking-widest font-black text-text-muted hover:text-text-prime transition">View All Campaigns</button>
                                    </div>
                                    <div className="grid gap-4">
                                        {requests.slice(0, 3).map((r, i) => (
                                            <div key={i} className="p-6 border border-white/5 rounded-panel hover:bg-white/[0.02] transition-all flex justify-between items-center group">
                                                <div className="space-y-1">
                                                    <h4 className="font-bold text-text-prime group-hover:translate-x-1 transition-transform">{r.title}</h4>
                                                    <p className="text-xs text-text-muted uppercase tracking-widest font-bold">{r.budget} | {r.promotionType}</p>
                                                </div>
                                                <button className="text-[10px] px-6 py-2 border border-white/10 rounded-full font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Command Details</button>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            <aside className="space-y-12 bg-white/[0.01] p-8 rounded-panel border border-white/5">
                                <div className="space-y-6">
                                    <h3 className="text-[10px] uppercase tracking-[0.4em] text-text-muted font-bold">System Signals</h3>
                                    <div className="space-y-4 opacity-50 pointer-events-none">
                                        <p className="text-xs italic">All performance vectors stable in your sector.</p>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    )}

                    {activeTab === 'search' && <EnhancedCreatorSearch />}
                    {activeTab === 'messages' && <MessagingPanel />}
                    {activeTab === 'team' && <TeamManagement />}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SellerDashboard;

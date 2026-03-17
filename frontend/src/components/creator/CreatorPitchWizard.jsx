import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiLocationMarker, HiCurrencyRupee, HiCalendar, HiSparkles, HiX, HiLightningBolt } from 'react-icons/hi';
import { availabilityAPI } from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Fashion', 'Tech', 'Fitness', 'Food', 'Travel', 'Lifestyle', 'Beauty', 'Gaming', 'Education', 'Entertainment', 'Health', 'Business', 'Art', 'Music', 'Sports', 'Other'];

const CreatorPitchWizard = ({ onClose, onSuccess, initialData = null }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        niche: initialData?.niche || 'Lifestyle',
        locationCity: initialData?.locationCity || '',
        locationState: initialData?.locationState || '',
        locationCountry: 'India',
        collaborationBudgetMin: initialData?.collaborationBudgetMin || 2000,
        collaborationBudgetMax: initialData?.collaborationBudgetMax || 5000,
        durationDays: initialData?.durationDays || 5,
        description: initialData?.description || '',
        deliverablesOffered: initialData?.deliverablesOffered || ['UGC Video', 'Instagram Post']
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await availabilityAPI.create(formData);
            toast.success('Collab Request Raised Successfully!');
            if (onSuccess) onSuccess();
            if (onClose) onClose();
        } catch (error) {
            console.error('Error raising pitch:', error);
            toast.error(error.response?.data?.message || 'Failed to raise request');
        } finally {
            setLoading(false);
        }
    };

    const addDeliverable = (del) => {
        if (!formData.deliverablesOffered.includes(del)) {
            setFormData(prev => ({
                ...prev,
                deliverablesOffered: [...prev.deliverablesOffered, del]
            }));
        }
    };

    const removeDeliverable = (del) => {
        setFormData(prev => ({
            ...prev,
            deliverablesOffered: prev.deliverablesOffered.filter(d => d !== del)
        }));
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <HiSparkles className="text-primary-400" />
                        Raise Collab Request
                    </h2>
                    <p className="text-dark-400 text-sm">Tell nearby brands when and where you are available.</p>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-2 hover:bg-dark-800 rounded-full text-dark-400 transition-colors">
                        <HiX size={24} />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Niche & Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-dark-300">Niche / Category</label>
                        <select
                            name="niche"
                            value={formData.niche}
                            onChange={handleChange}
                            className="w-full bg-dark-800/50 border border-dark-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500/50 transition-all shadow-inner"
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-dark-300">City (Where are you?)</label>
                        <div className="relative">
                            <HiLocationMarker className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500" />
                            <input
                                type="text"
                                name="locationCity"
                                value={formData.locationCity}
                                onChange={handleChange}
                                placeholder="e.g. Delhi, Mumbai"
                                className="w-full bg-dark-800/50 border border-dark-700/50 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-primary-500/50 transition-all shadow-inner"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Budget Range */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-dark-300">Expected Budget Range (₹)</label>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <HiCurrencyRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500" />
                            <input
                                type="number"
                                name="collaborationBudgetMin"
                                value={formData.collaborationBudgetMin}
                                onChange={handleChange}
                                className="w-full bg-dark-800/50 border border-dark-700/50 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-primary-500/50 transition-all shadow-inner"
                                required
                            />
                        </div>
                        <span className="text-dark-500">to</span>
                        <div className="relative flex-1">
                            <HiCurrencyRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500" />
                            <input
                                type="number"
                                name="collaborationBudgetMax"
                                value={formData.collaborationBudgetMax}
                                onChange={handleChange}
                                className="w-full bg-dark-800/50 border border-dark-700/50 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-primary-500/50 transition-all shadow-inner"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-dark-300">Duration (Days Active)</label>
                    <div className="relative">
                        <HiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500" />
                        <input
                            type="number"
                            name="durationDays"
                            value={formData.durationDays}
                            onChange={handleChange}
                            min="1"
                            max="10"
                            className="w-full bg-dark-800/50 border border-dark-700/50 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-primary-500/50 transition-all shadow-inner"
                            required
                        />
                        <p className="text-xs text-dark-500 mt-1">* Premium users can go up to 10 days.</p>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-dark-300">Description / Message to Brands</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="I will be in Delhi for 5 days and I'm open to visit stores for UGC content..."
                        className="w-full bg-dark-800/50 border border-dark-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500/50 transition-all shadow-inner min-h-[100px]"
                        required
                    />
                </div>

                {/* Deliverables Chip UI */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-dark-300">Deliverables You Offer</label>
                    <div className="flex flex-wrap gap-2">
                        {['UGC Video', 'Instagram Post', 'Story Hack', 'YouTube Shoutout', 'Event Attendance'].map(del => (
                            <button
                                key={del}
                                type="button"
                                onClick={() => formData.deliverablesOffered.includes(del) ? removeDeliverable(del) : addDeliverable(del)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    formData.deliverablesOffered.includes(del)
                                        ? 'bg-primary-500/20 text-primary-400 border border-primary-500/50'
                                        : 'bg-dark-800 text-dark-400 border border-dark-700/50 hover:border-dark-600'
                                }`}
                            >
                                {del}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? 'Raising Request...' : 'Raise Request Now'}
                        <HiLightningBolt className={loading ? 'animate-pulse' : ''} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatorPitchWizard;

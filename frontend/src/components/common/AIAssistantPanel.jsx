import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMagic, FaTimes, FaHashtag, FaLightbulb, FaClock, FaCopy } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { generateCaption, generateHashtags, generateContentIdeas, generatePostingSchedule } from '../../services/aiContentGenerator';
import toast from 'react-hot-toast';

/**
 * AI Content Assistant Panel
 * Floating panel for AI-powered content generation
 */
const AIAssistantPanel = ({ campaign = {}, onUse }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('captions');
    const [generatedContent, setGeneratedContent] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const [captionParams, setCaptionParams] = useState({
        productName: campaign.title || '',
        brandName: campaign.brand || '',
        category: campaign.category || 'Lifestyle',
        style: 'casual',
        tone: 'excited',
        length: 'medium'
    });

    const handleGenerateCaption = () => {
        setIsGenerating(true);
        setTimeout(() => {
            const caption = generateCaption(captionParams);
            setGeneratedContent({ type: 'caption', content: caption });
            setIsGenerating(false);
            toast.success('Caption generated!');
        }, 1000);
    };

    const handleGenerateHashtags = () => {
        setIsGenerating(true);
        setTimeout(() => {
            const hashtags = generateHashtags({
                category: captionParams.category,
                count: 20,
                brandName: captionParams.brandName
            });
            setGeneratedContent({ type: 'hashtags', content: hashtags });
            setIsGenerating(false);
            toast.success('Hashtags generated!');
        }, 800);
    };

    const handleGenerateIdeas = () => {
        setIsGenerating(true);
        setTimeout(() => {
            const ideas = generateContentIdeas({
                productType: 'Product',
                category: captionParams.category,
                promotionType: campaign.type || 'Post'
            });
            setGeneratedContent({ type: 'ideas', content: ideas });
            setIsGenerating(false);
            toast.success('Ideas generated!');
        }, 1000);
    };

    const handleGenerateSchedule = () => {
        setIsGenerating(true);
        setTimeout(() => {
            const schedule = generatePostingSchedule(captionParams.category);
            setGeneratedContent({ type: 'schedule', content: schedule });
            setIsGenerating(false);
            toast.success('Schedule generated!');
        }, 800);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    const useContent = () => {
        if (generatedContent && onUse) {
            onUse(generatedContent);
            toast.success('Content applied!');
        }
    };

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-24 right-6 z-40 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-2xl flex items-center justify-center text-white"
                >
                    <FaMagic className="text-xl" />
                </motion.button>
            )}

            {/* Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-dark-900 border-l border-dark-800 shadow-2xl z-50 overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 z-10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <HiSparkles className="text-3xl text-white" />
                                        <div>
                                            <h2 className="text-xl font-bold text-white">AI Assistant</h2>
                                            <p className="text-white/80 text-sm">Powered by TheCollabify AI</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                    >
                                        <FaTimes className="text-white" />
                                    </button>
                                </div>

                                {/* Tabs */}
                                <div className="flex gap-2 mt-4">
                                    {[
                                        { id: 'captions', label: 'Captions', icon: <FaMagic /> },
                                        { id: 'hashtags', label: 'Hashtags', icon: <FaHashtag /> },
                                        { id: 'ideas', label: 'Ideas', icon: <FaLightbulb /> },
                                        { id: 'schedule', label: 'Schedule', icon: <FaClock /> }
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                                ? 'bg-white text-purple-600'
                                                : 'bg-white/20 text-white hover:bg-white/30'
                                                }`}
                                        >
                                            <span className="flex items-center justify-center gap-1">
                                                {tab.icon}
                                                <span className="hidden sm:inline">{tab.label}</span>
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                {/* Caption Generator */}
                                {activeTab === 'captions' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-dark-200 mb-2">
                                                Product Name
                                            </label>
                                            <input
                                                type="text"
                                                value={captionParams.productName}
                                                onChange={(e) => setCaptionParams({ ...captionParams, productName: e.target.value })}
                                                className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-dark-100 focus:border-purple-500 focus:outline-none"
                                                placeholder="Amazing Product"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-dark-200 mb-2">
                                                Brand Name
                                            </label>
                                            <input
                                                type="text"
                                                value={captionParams.brandName}
                                                onChange={(e) => setCaptionParams({ ...captionParams, brandName: e.target.value })}
                                                className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-dark-100 focus:border-purple-500 focus:outline-none"
                                                placeholder="YourBrand"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-dark-200 mb-2">
                                                Style
                                            </label>
                                            <select
                                                value={captionParams.style}
                                                onChange={(e) => setCaptionParams({ ...captionParams, style: e.target.value })}
                                                className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-dark-100 focus:border-purple-500 focus:outline-none"
                                            >
                                                <option value="casual">Casual</option>
                                                <option value="professional">Professional</option>
                                                <option value="storytelling">Storytelling</option>
                                                <option value="promotional">Promotional</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-dark-200 mb-2">
                                                Length
                                            </label>
                                            <div className="flex gap-2">
                                                {['short', 'medium', 'long'].map(len => (
                                                    <button
                                                        key={len}
                                                        onClick={() => setCaptionParams({ ...captionParams, length: len })}
                                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${captionParams.length === len
                                                            ? 'bg-purple-600 text-white'
                                                            : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                                                            }`}
                                                    >
                                                        {len.charAt(0).toUpperCase() + len.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleGenerateCaption}
                                            disabled={isGenerating}
                                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 disabled:opacity-50 text-white rounded-lg font-medium transition-opacity"
                                        >
                                            {isGenerating ? 'Generating...' : 'Generate Caption'}
                                        </button>
                                    </div>
                                )}

                                {/* Hashtags Generator */}
                                {activeTab === 'hashtags' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-dark-200 mb-2">
                                                Category
                                            </label>
                                            <select
                                                value={captionParams.category}
                                                onChange={(e) => setCaptionParams({ ...captionParams, category: e.target.value })}
                                                className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-dark-100 focus:border-purple-500 focus:outline-none"
                                            >
                                                {['Fashion', 'Beauty', 'Tech', 'Lifestyle', 'Food', 'Travel', 'Fitness'].map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <button
                                            onClick={handleGenerateHashtags}
                                            disabled={isGenerating}
                                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 disabled:opacity-50 text-white rounded-lg font-medium transition-opacity"
                                        >
                                            {isGenerating ? 'Generating...' : 'Generate Hashtags'}
                                        </button>
                                    </div>
                                )}

                                {/* Content Ideas */}
                                {activeTab === 'ideas' && (
                                    <div className="space-y-4">
                                        <button
                                            onClick={handleGenerateIdeas}
                                            disabled={isGenerating}
                                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 disabled:opacity-50 text-white rounded-lg font-medium transition-opacity"
                                        >
                                            {isGenerating ? 'Generating...' : 'Generate Content Ideas'}
                                        </button>
                                    </div>
                                )}

                                {/* Posting Schedule */}
                                {activeTab === 'schedule' && (
                                    <div className="space-y-4">
                                        <button
                                            onClick={handleGenerateSchedule}
                                            disabled={isGenerating}
                                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 disabled:opacity-50 text-white rounded-lg font-medium transition-opacity"
                                        >
                                            {isGenerating ? 'Generating...' : 'Get Optimal Schedule'}
                                        </button>
                                    </div>
                                )}

                                {/* Generated Content Display */}
                                {generatedContent && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-dark-800 border border-dark-700 rounded-xl p-4 space-y-3"
                                    >
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-dark-100">Generated Content</h3>
                                            <button
                                                onClick={() => copyToClipboard(
                                                    Array.isArray(generatedContent.content)
                                                        ? generatedContent.content.join(' ')
                                                        : generatedContent.content
                                                )}
                                                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                                            >
                                                <FaCopy className="text-dark-400" />
                                            </button>
                                        </div>

                                        <div className="text-dark-200 text-sm whitespace-pre-wrap">
                                            {generatedContent.type === 'hashtags' && (
                                                <div className="flex flex-wrap gap-2">
                                                    {generatedContent.content.map((tag, i) => (
                                                        <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {generatedContent.type === 'ideas' && (
                                                <ul className="space-y-2">
                                                    {generatedContent.content.map((idea, i) => (
                                                        <li key={i} className="flex items-start gap-2">
                                                            <span className="text-purple-400">•</span>
                                                            <span>{idea}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}

                                            {generatedContent.type === 'schedule' && (
                                                <div className="space-y-2">
                                                    {generatedContent.content.map((slot, i) => (
                                                        <div key={i} className="flex items-center justify-between p-2 bg-dark-700 rounded">
                                                            <span>{slot.day}</span>
                                                            <span className="text-purple-400">{slot.time}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {generatedContent.type === 'caption' && (
                                                <p>{generatedContent.content}</p>
                                            )}
                                        </div>

                                        {onUse && (
                                            <button
                                                onClick={useContent}
                                                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                                            >
                                                Use This Content
                                            </button>
                                        )}
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIAssistantPanel;

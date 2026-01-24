import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaRobot, FaMagic, FaCopy, FaCheck, FaHashtag } from 'react-icons/fa';
import { aiAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AIContentGenerator = ({ onSelect, platform = 'instagram' }) => {
    const [activeTab, setActiveTab] = useState('caption'); // caption, hashtags
    const [topic, setTopic] = useState('');
    const [tone, setTone] = useState('professional');
    const [niche, setNiche] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatedContent, setGeneratedContent] = useState('');
    const [generatedHashtags, setGeneratedHashtags] = useState([]);
    const [copied, setCopied] = useState(false);

    const handleGenerateCaption = async () => {
        if (!topic) {
            toast.error('Please enter a topic');
            return;
        }

        setLoading(true);
        try {
            const response = await aiAPI.generateCaption({
                topic,
                platform,
                tone
            });
            setGeneratedContent(response.data.data.caption);
        } catch (error) {
            console.error('Error generating caption:', error);
            toast.error('Failed to generate content');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateHashtags = async () => {
        if (!topic) {
            toast.error('Please enter a topic');
            return;
        }

        setLoading(true);
        try {
            const response = await aiAPI.generateHashtags({
                topic,
                niche: niche || topic
            });
            setGeneratedHashtags(response.data.data.hashtags);
        } catch (error) {
            console.error('Error generating hashtags:', error);
            toast.error('Failed to generate hashtags');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Copied to clipboard!');
    };

    const handleUse = (text) => {
        if (onSelect) {
            onSelect(text);
        }
    };

    return (
        <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-b border-dark-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FaRobot className="text-purple-400" />
                    <h3 className="font-bold text-white">AI Assistant</h3>
                </div>
                <div className="flex bg-dark-900/50 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('caption')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${activeTab === 'caption'
                            ? 'bg-purple-600 text-white'
                            : 'text-dark-400 hover:text-white'
                            }`}
                    >
                        Caption
                    </button>
                    <button
                        onClick={() => setActiveTab('hashtags')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${activeTab === 'hashtags'
                            ? 'bg-purple-600 text-white'
                            : 'text-dark-400 hover:text-white'
                            }`}
                    >
                        Hashtags
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Inputs */}
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-dark-400 mb-1">
                            Topic / Keywords
                        </label>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., Summer sale announcement"
                            className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-sm text-white focus:border-purple-500 focus:outline-none"
                        />
                    </div>

                    {activeTab === 'caption' ? (
                        <div>
                            <label className="block text-xs font-medium text-dark-400 mb-1">
                                Tone
                            </label>
                            <select
                                value={tone}
                                onChange={(e) => setTone(e.target.value)}
                                className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-sm text-white focus:border-purple-500 focus:outline-none"
                            >
                                <option value="professional">Professional</option>
                                <option value="fun">Fun & Casual</option>
                                <option value="witty">Witty & Clever</option>
                            </select>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-xs font-medium text-dark-400 mb-1">
                                Niche (Optional)
                            </label>
                            <input
                                type="text"
                                value={niche}
                                onChange={(e) => setNiche(e.target.value)}
                                placeholder="e.g., Fashion, Tech"
                                className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-sm text-white focus:border-purple-500 focus:outline-none"
                            />
                        </div>
                    )}

                    <button
                        onClick={activeTab === 'caption' ? handleGenerateCaption : handleGenerateHashtags}
                        disabled={loading || !topic}
                        className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <FaMagic /> Generate
                            </>
                        )}
                    </button>
                </div>

                {/* Results - Caption */}
                {activeTab === 'caption' && generatedContent && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-dark-900 rounded-lg p-3 border border-dark-700"
                    >
                        <p className="text-sm text-dark-200 whitespace-pre-wrap">{generatedContent}</p>
                        <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-dark-800">
                            <button
                                onClick={() => handleCopy(generatedContent)}
                                className="p-1.5 text-dark-400 hover:text-white transition-colors"
                                title="Copy"
                            >
                                {copied ? <FaCheck className="text-green-400" /> : <FaCopy />}
                            </button>
                            <button
                                onClick={() => handleUse(generatedContent)}
                                className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded text-xs font-medium hover:bg-purple-600/30 transition-colors"
                            >
                                Use This
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Results - Hashtags */}
                {activeTab === 'hashtags' && generatedHashtags.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-dark-900 rounded-lg p-3 border border-dark-700"
                    >
                        <div className="flex flex-wrap gap-2">
                            {generatedHashtags.map((tag, i) => (
                                <span
                                    key={i}
                                    className="px-2 py-1 bg-dark-800 text-blue-400 rounded text-xs cursor-pointer hover:bg-dark-700"
                                    onClick={() => handleUse(tag + ' ')}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-dark-800">
                            <button
                                onClick={() => handleCopy(generatedHashtags.join(' '))}
                                className="p-1.5 text-dark-400 hover:text-white transition-colors"
                                title="Copy All"
                            >
                                {copied ? <FaCheck className="text-green-400" /> : <FaCopy />}
                            </button>
                            <button
                                onClick={() => handleUse(generatedHashtags.join(' '))}
                                className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded text-xs font-medium hover:bg-purple-600/30 transition-colors"
                            >
                                Use All
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default AIContentGenerator;

import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { FaInstagram, FaHeart, FaTimes, FaComments, FaStar, FaUndo, FaCheck, FaUserPlus } from 'react-icons/fa';
import { HiSparkles, HiLightningBolt } from 'react-icons/hi';

const SwipeableCreatorCard = ({ creators, onAccept, onReject, onRequest, onSave }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [lastAction, setLastAction] = useState(null);
    const [exitDirection, setExitDirection] = useState(null);
    const [showWhy, setShowWhy] = useState(false); // New State for AI Explanation

    const currentCreator = creators[currentIndex];

    const handleSwipe = (direction) => {
        setExitDirection(direction);
        setTimeout(() => {
            if (direction === 'right') {
                onAccept(currentCreator.requestId, currentCreator.creatorId);
                setLastAction({ type: 'accept', creator: currentCreator });
            } else {
                onReject(currentCreator.requestId, currentCreator.creatorId);
                setLastAction({ type: 'reject', creator: currentCreator });
            }
            setExitDirection(null);
            setCurrentIndex(prev => prev + 1);
            setShowWhy(false); // Reset explanation state
        }, 300);
    };

    const handleUndo = () => {
        if (lastAction && currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setLastAction(null);
            setShowWhy(false);
        }
    };

    const handleRequest = async () => {
        try {
            await onRequest(currentCreator.requestId, currentCreator.creatorId);
            setLastAction({ type: 'request', creator: currentCreator });
            // Show success animation or toast here if needed
            setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
            }, 500);
        } catch (error) {
            console.error('Failed to send request', error);
        }
    };

    if (!currentCreator || currentIndex >= creators.length) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 px-6"
            >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center mb-6">
                    <HiSparkles className="text-4xl text-primary-400" />
                </div>
                <h3 className="text-xl font-bold text-dark-100 mb-2">All caught up! 🎉</h3>
                <p className="text-dark-400 text-center max-w-sm">
                    You've reviewed all pending creator applications. Create a new campaign to get more matches.
                </p>
            </motion.div>
        );
    }

    return (
        <div className="relative px-4 py-6">
            {/* Card Stack */}
            <div className="relative h-[480px] max-w-sm mx-auto">
                {/* Background cards for stack effect */}
                {creators.slice(currentIndex + 1, currentIndex + 3).map((_, i) => (
                    <div
                        key={i}
                        className="absolute inset-x-0 top-0 h-full rounded-3xl bg-dark-800/60 border border-dark-700/50"
                        style={{
                            transform: `scale(${1 - (i + 1) * 0.05}) translateY(${(i + 1) * 15}px)`,
                            opacity: 1 - (i + 1) * 0.3,
                            zIndex: -i - 1
                        }}
                    />
                ))}

                {/* Main Swipeable Card */}
                <AnimatePresence mode="wait">
                    <SwipeCard
                        key={currentCreator.creatorId}
                        creator={currentCreator}
                        onSwipe={handleSwipe}
                        exitDirection={exitDirection}
                        showWhy={showWhy}
                        setShowWhy={setShowWhy}
                    />
                </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4 mt-6">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleUndo}
                    disabled={!lastAction}
                    className="w-12 h-12 rounded-full bg-dark-700/50 border border-dark-600 flex items-center justify-center text-dark-400 hover:text-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <FaUndo />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSwipe('left')}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-red-500/30"
                >
                    <FaTimes className="text-2xl" />
                </motion.button>

                {/* Gated Messaging / Request Button */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleRequest} // Use handleRequest instead of onMessage
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 relative group"
                    title="Request Collaboration"
                >
                    <FaUserPlus /> {/* Changed icon to represent request */}

                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-dark-900 border border-dark-700 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Request Collaboration
                    </span>
                </motion.button>


                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSwipe('right')}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30"
                >
                    <FaHeart className="text-2xl" />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onSave?.(currentCreator)}
                    className="w-12 h-12 rounded-full bg-dark-700/50 border border-dark-600 flex items-center justify-center text-dark-400 hover:text-primary-400 transition-colors"
                >
                    <FaStar />
                </motion.button>
            </div>

            {/* Swipe Instructions */}
            <div className="flex justify-center gap-8 mt-4">
                <span className="text-xs text-dark-500 flex items-center gap-1">
                    <FaTimes className="text-red-400" /> Swipe left to reject
                </span>
                <span className="text-xs text-dark-500 flex items-center gap-1">
                    <FaHeart className="text-emerald-400" /> Swipe right to accept
                </span>
            </div>
        </div>
    );
};

// Individual Swipe Card Component
const SwipeCard = ({ creator, onSwipe, exitDirection, showWhy, setShowWhy }) => {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-15, 15]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

    // Overlay opacity for accept/reject indicators
    const acceptOpacity = useTransform(x, [0, 100, 200], [0, 0.5, 1]);
    const rejectOpacity = useTransform(x, [-200, -100, 0], [1, 0.5, 0]);

    const handleDragEnd = (_, info) => {
        if (info.offset.x > 100) {
            onSwipe('right');
        } else if (info.offset.x < -100) {
            onSwipe('left');
        }
    };

    return (
        <motion.div
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            style={{ x, rotate, opacity }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{
                scale: 1,
                opacity: 1,
                x: exitDirection === 'left' ? -300 : exitDirection === 'right' ? 300 : 0,
            }}
            exit={{
                x: exitDirection === 'left' ? -300 : 300,
                opacity: 0,
                transition: { duration: 0.3 }
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            <div className="relative h-full rounded-3xl overflow-hidden bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700/50 shadow-2xl">

                {/* Accept Overlay */}
                <motion.div
                    className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center z-10 pointer-events-none"
                    style={{ opacity: acceptOpacity }}
                >
                    <div className="w-24 h-24 rounded-full border-4 border-emerald-500 flex items-center justify-center rotate-[-15deg]">
                        <span className="text-3xl font-black text-emerald-500">ACCEPT</span>
                    </div>
                </motion.div>

                {/* Reject Overlay */}
                <motion.div
                    className="absolute inset-0 bg-red-500/20 flex items-center justify-center z-10 pointer-events-none"
                    style={{ opacity: rejectOpacity }}
                >
                    <div className="w-24 h-24 rounded-full border-4 border-red-500 flex items-center justify-center rotate-[15deg]">
                        <span className="text-3xl font-black text-red-500">NOPE</span>
                    </div>
                </motion.div>

                {/* Creator Photo/Avatar Area */}
                <div className="h-64 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 flex items-center justify-center">
                    <div className="text-8xl font-black text-white/90">
                        {creator.creatorName?.charAt(0).toUpperCase() || 'C'}
                    </div>
                </div>

                {/* Creator Info */}
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-dark-100">{creator.creatorName}</h3>
                            <div className="flex items-center gap-2 text-dark-400">
                                <FaInstagram className="text-pink-400" />
                                <span className="font-medium">{(creator.followerCount || 0).toLocaleString()} followers</span>
                            </div>
                        </div>
                        <HiLightningBolt />
                        <span className="text-sm font-medium">Active</span>
                    </div>
                    {creator.location?.city && (
                        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/20 text-purple-400">
                            <span className="text-sm font-medium">{creator.location.city}</span>
                        </div>
                    )}
                </div>

                {/* Campaign Info */}
                <div className="p-4 rounded-2xl bg-dark-800/60 border border-dark-700/50 relative">
                    {/* Confidence Badge */}
                    {creator.confidenceLevel && (
                        <div className={`absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-bold border shadow-lg ${creator.confidenceLevel === 'High' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                            creator.confidenceLevel === 'Medium' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                'bg-purple-500/20 text-purple-400 border-purple-500/30'
                            }`}>
                            {creator.confidenceLevel === 'High' ? 'High Confidence' :
                                creator.confidenceLevel === 'Medium' ? 'Medium Confidence' : 'Experimental'}
                        </div>
                    )}
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-dark-400 uppercase tracking-wider">Charge Range</span>
                        <div className="text-right">
                            <span className="text-lg font-bold text-emerald-400">
                                ₹{creator.minPrice ? creator.minPrice.toLocaleString() : '0'}
                            </span>
                            {creator.maxPrice && (
                                <span className="text-sm text-emerald-500/80 ml-1">
                                    - {(creator.maxPrice).toLocaleString()}
                                </span>
                            )}
                        </div>
                    </div>
                    <p className="text-dark-200 font-medium">{creator.requestTitle}</p>
                </div>

                {/* Quick Stats */}
                <div className="flex justify-around text-center">
                    <div>
                        <div className="text-xl font-bold text-dark-100">{creator.promotionType || 'Story'}</div>
                        <div className="text-xs text-dark-400">Type</div>
                    </div>
                    <div className="w-px bg-dark-700"></div>
                    <div>
                        <div className="text-xl font-bold text-dark-100">{creator.niche || 'General'}</div>
                        <div className="text-xs text-dark-400">Niche</div>
                    </div>
                </div>
            </div>

            {/* "Why This Match?" Overlay */}
            <AnimatePresence>
                {showWhy && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="absolute inset-0 z-20 bg-dark-900/95 backdrop-blur-md p-6 flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-xl font-bold text-white flex items-center gap-2">
                                <HiSparkles className="text-primary-400" />
                                Why this match?
                            </h4>
                            <button
                                onClick={() => setShowWhy(false)}
                                className="w-8 h-8 rounded-full bg-dark-800 flex items-center justify-center text-dark-400 hover:text-white transition-colors"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="space-y-4 flex-1 overflow-y-auto">
                            {/* Learning Narrative */}
                            {creator.learningInsight && (
                                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-sm leading-relaxed flex gap-3">
                                    <span className="text-xl">🤖</span>
                                    <span dangerouslySetInnerHTML={{ __html: creator.learningInsight }} />
                                </div>
                            )}

                            {creator.matchReasons && creator.matchReasons.length > 0 ? (
                                creator.matchReasons.map((reason, idx) => (
                                    <div key={idx} className="p-3 rounded-xl bg-dark-800/50 border border-dark-700/50 text-dark-200 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: reason }}>
                                    </div>
                                ))
                            ) : (
                                <div className="p-3 rounded-xl bg-dark-800/50 border border-dark-700/50 text-dark-200 text-sm">
                                    ⚡ <strong>Solid Match:</strong> Meets your basic criteria for budget and category.
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setShowWhy(false)}
                            className="mt-4 w-full py-3 rounded-xl bg-primary-600 text-white font-bold text-sm tracking-wide"
                        >
                            GOT IT
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Info Button Trigger */}
            {!showWhy && (
                <button
                    onClick={(e) => { e.stopPropagation(); setShowWhy(true); }}
                    className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-dark-900/80 backdrop-blur text-xs font-bold text-primary-400 border border-primary-500/30 shadow-lg hover:bg-primary-500/20 transition-all flex items-center gap-2"
                >
                    <HiSparkles />
                    Why?
                </button>
            )}
        </motion.div>
    );
};

export default SwipeableCreatorCard;

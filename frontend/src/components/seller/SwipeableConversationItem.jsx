import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { FaTrash } from 'react-icons/fa';

const SwipeableConversationItem = ({ conversation, isSelected, onClick, onDelete, formatTime, peek }) => {
    const x = useMotionValue(0);
    const opacity = useTransform(x, [-100, -50], [1, 0]);
    const deleteOpacity = useTransform(x, [-100, -50], [1, 0]);

    // Background color opacity based on drag
    const bgOpacity = useTransform(x, [-100, 0], [1, 0]);

    // Peek animation for onboarding
    useEffect(() => {
        if (peek) {
            const sequence = async () => {
                await animate(x, -60, { duration: 0.6, ease: "easeInOut" });
                await new Promise(resolve => setTimeout(resolve, 300));
                await animate(x, 0, { duration: 0.5, ease: "easeInOut" });
            };
            sequence();
        }
    }, [peek, x]);

    // Peek animation for onboarding
    useEffect(() => {
        if (peek) {
            const sequence = async () => {
                await animate(x, -60, { duration: 0.6, ease: "easeInOut" });
                await new Promise(resolve => setTimeout(resolve, 300));
                await animate(x, 0, { duration: 0.5, ease: "easeInOut" });
            };
            sequence();
        }
    }, [peek, x]);

    const handleDragEnd = (_, info) => {
        if (info.offset.x < -100) {
            onDelete(conversation._id);
        }
    };

    return (
        <div className="relative overflow-hidden border-b border-dark-700/30">
            {/* Delete Action Background */}
            <motion.div
                className="absolute inset-0 bg-red-500 flex items-center justify-end px-6 z-0"
                style={{ opacity: bgOpacity }}
            >
                <FaTrash className="text-white text-lg" />
            </motion.div>

            {/* Swipeable Content */}
            <motion.div
                className={`relative z-10 p-s4 cursor-pointer bg-dark-900 transition-colors ${isSelected ? 'bg-dark-800' : 'hover:bg-dark-800/50'
                    }`}
                style={{ x }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                onClick={() => {
                    // Only click if not dragging
                    if (x.get() === 0) onClick(conversation);
                }}
            >
                <div className="flex items-center gap-s3 pointer-events-none"> {/* Disable pointer events on children to prevent drag interference */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0 shadow-glow">
                        <span className="text-white font-black">
                            {conversation.creatorUserId?.name?.charAt(0) || 'C'}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <p className="text-body font-bold text-dark-100 truncate">
                                {conversation.creatorUserId?.name || 'Creator'}
                            </p>
                            <span className="text-xs-pure font-bold text-dark-500 uppercase tracking-tight">
                                {formatTime(conversation.updatedAt)}
                            </span>
                        </div>
                        <p className="text-small text-dark-400 truncate font-medium">
                            {conversation.promotionRequestId?.title || 'Campaign'}
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SwipeableConversationItem;

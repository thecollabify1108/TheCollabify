import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Typing Indicator Component
 * Shows animated dots when user is typing
 */
const TypingIndicator = ({ typingUsers = [], variant = 'default' }) => {
    const hasTyping = typingUsers.length > 0;

    if (!hasTyping) return null;

    // Get typing user names
    const getTypingText = () => {
        const names = typingUsers.map(u => u.user?.name || 'User').slice(0, 3);

        if (names.length === 1) {
            return `${names[0]} is typing`;
        } else if (names.length === 2) {
            return `${names[0]} and ${names[1]} are typing`;
        } else if (names.length === 3) {
            return `${names[0]}, ${names[1]}, and ${names[2]} are typing`;
        } else {
            return `${names[0]}, ${names[1]}, and ${typingUsers.length - 2} others are typing`;
        }
    };

    // Dots animation (simple version)
    const SimpleDots = () => (
        <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary-500"
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.15
                    }}
                />
            ))}
        </div>
    );

    // Bubble variant (chat message style)
    const BubbleVariant = () => (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            className="inline-flex items-center gap-3 px-4 py-3 bg-dark-800 rounded-2xl rounded-bl-sm border border-dark-700 max-w-xs"
        >
            <div className="flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-primary-500"
                        animate={{
                            scale: [1, 1.4, 1],
                            opacity: [0.4, 1, 0.4]
                        }}
                        transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>
            <span className="text-xs text-dark-400">
                {getTypingText()}
            </span>
        </motion.div>
    );

    // Inline variant (small text with dots)
    const InlineVariant = () => (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 text-sm text-primary-400 italic"
        >
            <SimpleDots />
            <span>{getTypingText()}</span>
        </motion.div>
    );

    // Compact variant (just dots)
    const CompactVariant = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
        >
            <SimpleDots />
        </motion.div>
    );

    const variants = {
        bubble: BubbleVariant,
        inline: InlineVariant,
        compact: CompactVariant,
        default: BubbleVariant
    };

    const SelectedVariant = variants[variant] || variants.default;

    return (
        <AnimatePresence mode="wait">
            {hasTyping && <SelectedVariant />}
        </AnimatePresence>
    );
};

TypingIndicator.propTypes = {
    typingUsers: PropTypes.arrayOf(
        PropTypes.shape({
            userId: PropTypes.string.isRequired,
            user: PropTypes.shape({
                name: PropTypes.string
            })
        })
    ),
    variant: PropTypes.oneOf(['bubble', 'inline', 'compact', 'default'])
};

export default TypingIndicator;

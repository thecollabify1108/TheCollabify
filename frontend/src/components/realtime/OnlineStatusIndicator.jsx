import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * Online Status Indicator Component
 * Shows green dot if user is online
 */
const OnlineStatusIndicator = ({
    isOnline,
    size = 'sm',
    showLabel = false,
    position = 'standalone' // 'standalone', 'avatar', 'corner'
}) => {
    const sizeClasses = {
        xs: 'w-2 h-2',
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5'
    };

    const positionClasses = {
        standalone: '',
        avatar: 'absolute bottom-0 right-0 border-2 border-dark-900',
        corner: 'absolute top-1 right-1'
    };

    const Indicator = () => (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`rounded-full ${sizeClasses[size]} ${positionClasses[position]} ${isOnline
                    ? 'bg-green-500 shadow-green-500/50 shadow-lg'
                    : 'bg-gray-500'
                }`}
        >
            {isOnline && (
                <motion.div
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0, 0.5]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className={`w-full h-full rounded-full bg-green-400`}
                />
            )}
        </motion.div>
    );

    if (!showLabel) {
        return <Indicator />;
    }

    return (
        <div className="flex items-center gap-2">
            <Indicator />
            <span className={`text-sm ${isOnline ? 'text-green-400' : 'text-gray-500'}`}>
                {isOnline ? 'Online' : 'Offline'}
            </span>
        </div>
    );
};

OnlineStatusIndicator.propTypes = {
    isOnline: PropTypes.bool.isRequired,
    size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
    showLabel: PropTypes.bool,
    position: PropTypes.oneOf(['standalone', 'avatar', 'corner'])
};

export default OnlineStatusIndicator;

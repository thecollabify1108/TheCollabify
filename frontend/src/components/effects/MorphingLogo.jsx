import { motion } from 'framer-motion';
import { useState } from 'react';

/**
 * MorphingLogo - SVG path morphing animation
 * Smoothly transitions between different SVG shapes
 * Requires deep understanding of SVG path data
 */
const MorphingLogo = ({ className = '' }) => {
    const [state, setState] = useState('default');

    // Different SVG path states
    const pathVariants = {
        default: {
            d: "M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z",
            fill: "#8B5CF6"
        },
        hovered: {
            d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z",
            fill: "#EC4899"
        },
        clicked: {
            d: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
            fill: "#10B981"
        }
    };

    return (
        <motion.svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            className={`cursor-pointer ${className}`}
            onHoverStart={() => setState('hovered')}
            onHoverEnd={() => setState('default')}
            onTap={() => {
                setState('clicked');
                setTimeout(() => setState('default'), 500);
            }}
        >
            <motion.path
                variants={pathVariants}
                animate={state}
                transition={{
                    duration: 0.5,
                    ease: "easeInOut"
                }}
            />

            {/* Inner animated element */}
            <motion.circle
                cx="12"
                cy="12"
                r="3"
                fill="white"
                opacity="0.8"
                animate={{
                    scale: state === 'clicked' ? [1, 1.5, 1] : 1,
                    opacity: state === 'clicked' ? [0.8, 0, 0.8] : 0.8
                }}
                transition={{ duration: 0.5 }}
            />
        </motion.svg>
    );
};

/**
 * IconMorph - Generic morphing icon component
 * Can morph between any two SVG paths
 */
export const IconMorph = ({ pathA, pathB, isActive, className = '' }) => {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className={className}
        >
            <motion.path
                d={isActive ? pathB : pathA}
                fill="currentColor"
                animate={{ d: isActive ? pathB : pathA }}
                transition={{
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1]
                }}
            />
        </svg>
    );
};

export default MorphingLogo;

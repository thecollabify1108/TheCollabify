import { motion } from 'framer-motion';
import { useState } from 'react';

/**
 * FlipCard3D - 3D card flip effect with perspective
 * Professional-grade 3D transformation
 */
const FlipCard3D = ({ front, back, className = '', onClick }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleClick = () => {
        setIsFlipped(!isFlipped);
        if (onClick) onClick(isFlipped);
    };

    return (
        <div
            className={`flip-card-container ${className}`}
            style={{ perspective: '1000px' }}
            onClick={handleClick}
        >
            <motion.div
                className="flip-card relative w-full h-full cursor-pointer"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{
                    duration: 0.8,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                }}
                style={{
                    transformStyle: "preserve-3d",
                    transformOrigin: "center"
                }}
            >
                {/* Front Face */}
                <div
                    className="absolute inset-0 w-full h-full"
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden'
                    }}
                >
                    {front}
                </div>

                {/* Back Face */}
                <div
                    className="absolute inset-0 w-full h-full"
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                    }}
                >
                    {back}
                </div>
            </motion.div>
        </div>
    );
};

export default FlipCard3D;

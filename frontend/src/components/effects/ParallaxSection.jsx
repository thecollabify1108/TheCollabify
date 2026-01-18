import { useRef } from 'react';
import { useScroll, useTransform, motion, useSpring } from 'framer-motion';

/**
 * ParallaxSection - Multi-layer parallax with depth that responds to scroll
 * Creates stunning depth effect impossible to replicate without deep physics knowledge
 */
const ParallaxSection = ({ children, className = '' }) => {
    const ref = useRef(null);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    // Create different speeds for different depth layers
    const y1 = useTransform(scrollYProgress, [0, 1], [0, -300]); // Background - slowest
    const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]); // Middle
    const y3 = useTransform(scrollYProgress, [0, 1], [0, -50]);  // Foreground - fastest

    // Opacity fade
    const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.3, 1, 1, 0.3]);
    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

    // Smooth the animations
    const y1Smooth = useSpring(y1, { stiffness: 100, damping: 30 });
    const y2Smooth = useSpring(y2, { stiffness: 100, damping: 30 });
    const y3Smooth = useSpring(y3, { stiffness: 100, damping: 30 });

    return (
        <div ref={ref} className={`relative min-h-screen overflow-hidden ${className}`}>
            {/* Background Layer - Decorative floating orbs */}
            <motion.div
                style={{ y: y1Smooth, opacity: 0.3 }}
                className="absolute inset-0 z-0"
            >
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl" />
            </motion.div>

            {/* Middle Layer - Grid pattern */}
            <motion.div
                style={{ y: y2Smooth, opacity: 0.1 }}
                className="absolute inset-0 z-10"
            >
                <div className="absolute inset-0"
                    style={{
                        backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
                                          linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }}
                />
            </motion.div>

            {/* Foreground Content */}
            <motion.div
                style={{ y: y3Smooth, opacity, scale }}
                className="relative z-20"
            >
                {children}
            </motion.div>
        </div>
    );
};

export default ParallaxSection;

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

/**
 * ScrollReveal - Animated component that fades up when scrolled into view
 * @param {ReactNode} children - Content to animate
 * @param {number} delay - Animation delay in seconds (default: 0)
 * @param {string} className - Additional CSS classes
 */
const ScrollReveal = ({ children, delay = 0, className = '' }) => {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
        rootMargin: '-50px'
    });

    const variants = {
        hidden: {
            opacity: 0,
            y: 50
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                delay: delay,
                ease: [0.25, 0.4, 0.25, 1]
            }
        }
    };

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={variants}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default ScrollReveal;

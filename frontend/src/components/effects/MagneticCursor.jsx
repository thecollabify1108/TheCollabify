import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * MagneticCursor - Premium custom cursor with magnetic attraction to interactive elements
 * This creates a sophisticated "pulled-in" feeling that's extremely hard to replicate
 */
const MagneticCursor = () => {
    const cursorX = useMotionValue(0);
    const cursorY = useMotionValue(0);
    const cursorSize = useMotionValue(32);

    // Spring physics for smooth, natural movement
    const springConfig = { damping: 25, stiffness: 200 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);
    const cursorSizeSpring = useSpring(cursorSize, springConfig);

    useEffect(() => {
        // Hide default cursor
        document.body.style.cursor = 'none';

        const moveCursor = (e) => {
            const baseX = e.clientX - 16;
            const baseY = e.clientY - 16;

            cursorX.set(baseX);
            cursorY.set(baseY);

            // Magnetic effect - attract to nearby interactive elements
            const magneticElements = document.querySelectorAll(
                'button, a, [data-magnetic], input, textarea, .btn-3d, .btn-secondary'
            );

            let isMagnetic = false;

            magneticElements.forEach(element => {
                const rect = element.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const distance = Math.sqrt(
                    Math.pow(e.clientX - centerX, 2) +
                    Math.pow(e.clientY - centerY, 2)
                );

                const magneticRadius = 80; // Attraction radius

                if (distance < magneticRadius) {
                    isMagnetic = true;
                    const strength = (magneticRadius - distance) / magneticRadius;
                    const pullX = (centerX - e.clientX) * strength * 0.4;
                    const pullY = (centerY - e.clientY) * strength * 0.4;

                    cursorX.set(baseX + pullX);
                    cursorY.set(baseY + pullY);
                    cursorSize.set(48); // Grow when hovering
                }
            });

            if (!isMagnetic) {
                cursorSize.set(32); // Normal size
            }
        };

        const handleMouseDown = () => cursorSize.set(24); // Shrink on click
        const handleMouseUp = () => cursorSize.set(32);

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.body.style.cursor = 'auto';
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [cursorX, cursorY, cursorSize]);

    // Don't show on mobile/tablet
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        return null;
    }

    return (
        <>
            {/* Main cursor */}
            <motion.div
                className="fixed pointer-events-none z-[99999] rounded-full mix-blend-difference"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                    width: cursorSizeSpring,
                    height: cursorSizeSpring,
                    background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                    opacity: 0.6,
                }}
            />

            {/* Trailing dot */}
            <motion.div
                className="fixed pointer-events-none z-[99998] w-2 h-2 rounded-full bg-white mix-blend-difference"
                style={{
                    x: cursorXSpring.get() + 15,
                    y: cursorYSpring.get() + 15,
                }}
            />
        </>
    );
};

export default MagneticCursor;

import { useState, useEffect } from 'react';

/**
 * Premium Logo component with CSS-driven animations.
 * - One-time rotation on page mount.
 * - Subtle tilt interaction on click.
 * - Respects prefers-reduced-motion via CSS.
 */
const Logo = ({ className = "h-8 w-8 object-contain", onClick, ...props }) => {
    const [isMounted, setIsMounted] = useState(false);
    const [isTilting, setIsTilting] = useState(false);

    useEffect(() => {
        // Trigger one-time rotation on mount
        setIsMounted(true);

        // Remove the class after animation completes to keep the DOM clean
        // and allow for subsequent hover/interaction states if needed.
        const timer = setTimeout(() => setIsMounted(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleLogoClick = (e) => {
        // Trigger tilt animation
        setIsTilting(true);

        // Remove tilt class after brief duration
        setTimeout(() => setIsTilting(false), 200);

        // Execute passed onClick handler if any
        if (onClick) onClick(e);
    };

    return (
        <img
            src="/favicon.png"
            alt="TheCollabify Logo"
            className={`${className} cursor-pointer transition-transform duration-300 ${isMounted ? 'animate-logo-mount' : ''} ${isTilting ? 'animate-logo-tilt' : ''}`}
            onClick={handleLogoClick}
            {...props}
        />
    );
};

export default Logo;

import { useState, useEffect, useRef, useCallback } from 'react';

const AnimatedCounter = ({
    end,
    duration = 2000,
    prefix = '',
    suffix = '',
    className = ''
}) => {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);
    const counterRef = useRef(null);

    const animateCount = useCallback(() => {
        const startTime = Date.now();
        const startValue = 0;

        const updateCount = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentCount = Math.floor(startValue + (end - startValue) * easeOutQuart);

            setCount(currentCount);

            if (progress < 1) {
                requestAnimationFrame(updateCount);
            }
        };

        requestAnimationFrame(updateCount);
    }, [duration, end]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasAnimated) {
                        setHasAnimated(true);
                        animateCount();
                    }
                });
            },
            { threshold: 0.5 }
        );

        if (counterRef.current) {
            observer.observe(counterRef.current);
        }

        return () => observer.disconnect();
    }, [hasAnimated, animateCount]);

    return (
        <span ref={counterRef} className={className}>
            {prefix}{count.toLocaleString()}{suffix}
        </span>
    );
};

export default AnimatedCounter;

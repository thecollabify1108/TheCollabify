import { useState, useEffect } from 'react';

const TypingAnimation = ({
    texts = [],
    typingSpeed = 100,
    deletingSpeed = 50,
    pauseTime = 2000,
    className = ''
}) => {
    const [displayText, setDisplayText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (texts.length === 0) return;

        const currentText = texts[currentIndex];

        const handleTyping = () => {
            if (isPaused) {
                const timeout = setTimeout(() => {
                    setIsPaused(false);
                    setIsDeleting(true);
                }, pauseTime);
                return () => clearTimeout(timeout);
            }

            if (isDeleting) {
                if (displayText === '') {
                    setIsDeleting(false);
                    setCurrentIndex((prev) => (prev + 1) % texts.length);
                } else {
                    const timeout = setTimeout(() => {
                        setDisplayText(prev => prev.slice(0, -1));
                    }, deletingSpeed);
                    return () => clearTimeout(timeout);
                }
            } else {
                if (displayText === currentText) {
                    setIsPaused(true);
                } else {
                    const timeout = setTimeout(() => {
                        setDisplayText(currentText.slice(0, displayText.length + 1));
                    }, typingSpeed);
                    return () => clearTimeout(timeout);
                }
            }
        };

        const cleanup = handleTyping();
        return cleanup;
    }, [displayText, currentIndex, isDeleting, isPaused, texts, typingSpeed, deletingSpeed, pauseTime]);

    return (
        <span className={className}>
            {displayText}
            <span className="animate-pulse">|</span>
        </span>
    );
};

export default TypingAnimation;

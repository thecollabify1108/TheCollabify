import { useState, useEffect } from 'react';

const Confetti = ({ active, duration = 3000, particleCount = 50, onComplete }) => {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        if (active) {
            const colors = [
                '#8b5cf6', // purple
                '#ec4899', // pink
                '#06b6d4', // cyan
                '#22c55e', // green
                '#f59e0b', // amber
                '#ef4444', // red
                '#3b82f6', // blue
            ];

            const newParticles = Array.from({ length: particleCount }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 8 + 4,
                rotation: Math.random() * 360,
                delay: Math.random() * 0.5
            }));

            setParticles(newParticles);

            // Clear particles after animation
            const timer = setTimeout(() => {
                setParticles([]);
                if (onComplete) onComplete();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [active, particleCount, duration, onComplete]);

    if (!active || particles.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="confetti-piece"
                    style={{
                        left: `${particle.x}%`,
                        backgroundColor: particle.color,
                        width: particle.size,
                        height: particle.size,
                        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                        transform: `rotate(${particle.rotation}deg)`,
                        animationDelay: `${particle.delay}s`
                    }}
                />
            ))}
        </div>
    );
};

export default Confetti;

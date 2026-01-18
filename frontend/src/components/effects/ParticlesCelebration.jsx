import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * ParticlesCelebration - Confetti/particle explosion for achievements
 * Canvas-based particle system with physics
 */
const ParticlesCelebration = ({ trigger, onComplete }) => {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);

    useEffect(() => {
        if (!trigger) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        class Particle {
            constructor(x, y) {
                this.x = x || canvas.width / 2;
                this.y = y || canvas.height / 2;

                // Random velocity
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 8 + 4;
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed - 5; // Upward bias

                // Physics
                this.gravity = 0.3;
                this.friction = 0.98;
                this.life = 100;
                this.maxLife = 100;

                // Visual
                this.size = Math.random() * 8 + 3;
                this.rotation = Math.random() * Math.PI * 2;
                this.rotationSpeed = (Math.random() - 0.5) * 0.2;

                // Random vibrant colors
                const colors = [
                    '#8B5CF6', // Purple
                    '#EC4899', // Pink
                    '#10B981', // Green
                    '#F59E0B', // Amber
                    '#3B82F6', // Blue
                    '#EF4444', // Red
                ];
                this.color = colors[Math.floor(Math.random() * colors.length)];

                // Shape
                this.shape = Math.random() > 0.5 ? 'square' : 'circle';
            }

            update() {
                // Apply physics
                this.vy += this.gravity;
                this.vx *= this.friction;
                this.vy *= this.friction;

                this.x += this.vx;
                this.y += this.vy;
                this.rotation += this.rotationSpeed;

                this.life--;
            }

            draw(ctx) {
                ctx.save();
                ctx.globalAlpha = this.life / this.maxLife;
                ctx.fillStyle = this.color;
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);

                if (this.shape === 'circle') {
                    ctx.beginPath();
                    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
                }

                ctx.restore();
            }

            isDead() {
                return this.life <= 0 || this.y > canvas.height + 50;
            }
        }

        // Create burst of particles
        const particleCount = 150;
        particlesRef.current = Array.from(
            { length: particleCount },
            () => new Particle()
        );

        let animationFrame;

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particlesRef.current.forEach((particle, index) => {
                if (particle.isDead()) {
                    particlesRef.current.splice(index, 1);
                } else {
                    particle.update();
                    particle.draw(ctx);
                }
            });

            if (particlesRef.current.length > 0) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                // Animation complete
                if (onComplete) onComplete();
            }
        }

        animate();

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [trigger, onComplete]);

    if (!trigger) return null;

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[9999]"
        />
    );
};

/**
 * CelebrationWrapper - Easy-to-use celebration trigger
 */
export const useCelebration = () => {
    const [showCelebration, setShowCelebration] = useState(false);

    const celebrate = () => {
        setShowCelebration(true);
    };

    const handleComplete = () => {
        setShowCelebration(false);
    };

    return {
        celebrate,
        CelebrationComponent: () => (
            <ParticlesCelebration
                trigger={showCelebration}
                onComplete={handleComplete}
            />
        )
    };
};

export default ParticlesCelebration;

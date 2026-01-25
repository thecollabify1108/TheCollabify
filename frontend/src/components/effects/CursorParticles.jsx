import { useEffect, useRef } from 'react';

const CursorParticles = () => {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const mouseRef = useRef({ x: 0, y: 0 });
    const animationFrameRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Set canvas size to window size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();

        // Particle class
        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 3 + 1; // Size between 1-4px
                this.speedX = Math.random() * 2 - 1; // Random horizontal drift
                this.speedY = Math.random() * 2 - 1; // Random vertical drift
                this.life = 100; // Particle lifespan
                this.maxLife = 100;

                // Random vibrant colors (Google-style)
                const colors = [
                    '#4285F4', // Google Blue
                    '#EA4335', // Google Red
                    '#FBBC04', // Google Yellow
                    '#34A853', // Google Green
                    '#FF6D00', // Deep Orange
                    '#9C27B0', // Purple
                    '#00BCD4', // Cyan
                    '#E91E63', // Pink
                    '#FF5722', // Red-Orange
                    '#8BC34A', // Light Green
                ];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.life -= 1;

                // Add slight gravity
                this.speedY += 0.05;
            }

            draw(ctx) {
                ctx.save();
                const opacity = this.life / this.maxLife;
                ctx.globalAlpha = opacity;
                ctx.fillStyle = this.color;

                // Draw as a small circle
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }
        }

        // Mouse move handler
        const handleMouseMove = (e) => {
            mouseRef.current.x = e.clientX;
            mouseRef.current.y = e.clientY;

            // Create multiple particles per movement for a denser trail
            for (let i = 0; i < 3; i++) {
                particlesRef.current.push(
                    new Particle(
                        e.clientX + Math.random() * 10 - 5,
                        e.clientY + Math.random() * 10 - 5
                    )
                );
            }

            // Limit the number of particles for performance
            if (particlesRef.current.length > 300) {
                particlesRef.current = particlesRef.current.slice(-300);
            }
        };

        // Animation loop
        const animate = () => {
            // Clear with slight trail effect
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update and draw particles
            particlesRef.current = particlesRef.current.filter(particle => {
                particle.update();
                particle.draw(ctx);
                return particle.life > 0;
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        // Event listeners
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', resizeCanvas);

        // Start animation
        animate();

        // Cleanup
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', resizeCanvas);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-50"
            style={{ mixBlendMode: 'normal' }}
        />
    );
};

export default CursorParticles;

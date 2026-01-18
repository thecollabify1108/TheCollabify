import { useEffect, useRef } from 'react';

/**
 * LiquidBackground - Animated liquid blobs using Canvas API
 * Extremely complex - requires graphics programming knowledge
 * Creates mesmerizing, organic movement impossible to copy easily
 */
const LiquidBackground = ({ className = '' }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Set canvas size
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        class Blob {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.radius = Math.random() * 150 + 100;
                this.vx = (Math.random() - 0.5) * 0.8;
                this.vy = (Math.random() - 0.5) * 0.8;

                // Random gradient colors
                const hue = Math.random() * 60 + 240; // Blues and purples
                this.color = `hsla(${hue}, 70%, 50%, 0.3)`;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges with some randomness
                if (this.x < 0 || this.x > canvas.width) {
                    this.vx *= -1;
                    this.vx += (Math.random() - 0.5) * 0.2; // Add variation
                }
                if (this.y < 0 || this.y > canvas.height) {
                    this.vy *= -1;
                    this.vy += (Math.random() - 0.5) * 0.2;
                }

                // Slight random movement for organic feel
                this.vx += (Math.random() - 0.5) * 0.05;
                this.vy += (Math.random() - 0.5) * 0.05;

                // Keep speed in check
                const maxSpeed = 1;
                const speed = Math.sqrt(this.vx ** 2 + this.vy ** 2);
                if (speed > maxSpeed) {
                    this.vx = (this.vx / speed) * maxSpeed;
                    this.vy = (this.vy / speed) * maxSpeed;
                }
            }

            draw(ctx) {
                // Create radial gradient
                const gradient = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.radius
                );
                gradient.addColorStop(0, this.color);
                gradient.addColorStop(1, 'transparent');

                ctx.fillStyle = gradient;
                ctx.filter = 'blur(40px)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Create 5-7 blobs for optimal performance
        const blobCount = 6;
        const blobs = Array.from({ length: blobCount }, () => new Blob());

        let animationFrame;

        function animate() {
            // Clear with slight trail effect
            ctx.fillStyle = 'rgba(13, 13, 13, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Use 'screen' blend mode for glowing effect
            ctx.globalCompositeOperation = 'screen';

            blobs.forEach(blob => {
                blob.update();
                blob.draw(ctx);
            });

            animationFrame = requestAnimationFrame(animate);
        }

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={`fixed inset-0 -z-10 opacity-40 ${className}`}
            style={{ pointerEvents: 'none' }}
        />
    );
};

export default LiquidBackground;

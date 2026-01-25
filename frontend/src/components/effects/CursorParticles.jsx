import { useEffect, useRef, useState } from 'react';

const CursorParticles = () => {
    const canvasRef = useRef(null);
    const trailPointsRef = useRef([]);
    const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const animationFrameRef = useRef(null);
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

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

        // Trail point class for smooth flowing effect
        class TrailPoint {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.life = 1; // Start at full opacity
                this.size = 40; // Size of the glow
            }

            update() {
                this.life -= 0.02; // Fade out gradually
                this.size += 0.5; // Expand slightly
            }

            draw(ctx) {
                if (this.life <= 0) return;

                ctx.save();

                // Create radial gradient for glow effect
                const gradient = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.size
                );

                // Premium gradient colors (purple to pink)
                const opacity = this.life * 0.3;
                gradient.addColorStop(0, `rgba(139, 92, 246, ${opacity})`); // Purple
                gradient.addColorStop(0.5, `rgba(236, 72, 153, ${opacity * 0.7})`); // Pink
                gradient.addColorStop(1, 'rgba(139, 92, 246, 0)'); // Transparent

                ctx.fillStyle = gradient;
                ctx.fillRect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);

                ctx.restore();
            }
        }

        // Mouse move handler
        const handleMouseMove = (e) => {
            const newX = e.clientX;
            const newY = e.clientY;

            mouseRef.current.x = newX;
            mouseRef.current.y = newY;
            setCursorPos({ x: newX, y: newY });

            // Add trail points for smooth flowing effect
            trailPointsRef.current.push(new TrailPoint(newX, newY));

            // Limit trail length for performance
            if (trailPointsRef.current.length > 30) {
                trailPointsRef.current = trailPointsRef.current.slice(-30);
            }

            // Check if hovering over interactive elements
            const target = e.target;
            const isInteractive = target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.closest('button') ||
                target.closest('a') ||
                target.style.cursor === 'pointer';
            setIsHovering(isInteractive);
        };

        // Animation loop
        const animate = () => {
            // Clear canvas with slight fade for motion blur effect
            ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Update and draw trail points
            trailPointsRef.current = trailPointsRef.current.filter(point => {
                point.update();
                point.draw(ctx);
                return point.life > 0;
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
        <>
            {/* Canvas for glow trail */}
            <canvas
                ref={canvasRef}
                className="fixed inset-0 pointer-events-none z-50"
                style={{ mixBlendMode: 'screen' }}
            />

            {/* Custom cursor dot */}
            <div
                className="fixed pointer-events-none z-[60] transition-transform duration-100"
                style={{
                    left: `${cursorPos.x}px`,
                    top: `${cursorPos.y}px`,
                    transform: `translate(-50%, -50%) scale(${isHovering ? 1.5 : 1})`,
                }}
            >
                {/* Outer ring */}
                <div
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${isHovering
                            ? 'border-primary-400 bg-primary-400/20'
                            : 'border-primary-500/50 bg-primary-500/10'
                        }`}
                    style={{
                        boxShadow: isHovering
                            ? '0 0 20px rgba(139, 92, 246, 0.6)'
                            : '0 0 10px rgba(139, 92, 246, 0.3)'
                    }}
                />
                {/* Inner dot */}
                <div
                    className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary-400 to-secondary-400"
                    style={{ transform: 'translate(-50%, -50%)' }}
                />
            </div>
        </>
    );
};

export default CursorParticles;

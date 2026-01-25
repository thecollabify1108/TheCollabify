import { useEffect, useRef } from 'react';

const CursorParticles = () => {
    const canvasRef = useRef(null);
    const nodesRef = useRef([]);
    const mouseRef = useRef({ x: null, y: null });
    const animationFrameRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Set canvas size to window size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initNodes();
        };
        resizeCanvas();

        // Node class for spider web mesh
        class Node {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.originalX = x;
                this.originalY = y;
                this.vx = 0;
                this.vy = 0;
            }

            update() {
                // Spring force to return to original position
                const springStrength = 0.01;
                const damping = 0.9;

                // Apply spring force
                this.vx += (this.originalX - this.x) * springStrength;
                this.vy += (this.originalY - this.y) * springStrength;

                // Repulsion from cursor/touch
                if (mouseRef.current.x !== null && mouseRef.current.y !== null) {
                    const dx = this.x - mouseRef.current.x;
                    const dy = this.y - mouseRef.current.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const repulsionRadius = 150; // Radius of repulsion effect

                    if (distance < repulsionRadius) {
                        const force = (repulsionRadius - distance) / repulsionRadius;
                        const angle = Math.atan2(dy, dx);
                        this.vx += Math.cos(angle) * force * 3;
                        this.vy += Math.sin(angle) * force * 3;
                    }
                }

                // Apply velocity with damping
                this.x += this.vx;
                this.y += this.vy;
                this.vx *= damping;
                this.vy *= damping;
            }

            draw(ctx) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';
                ctx.fill();
            }
        }

        // Initialize nodes in a grid pattern
        const initNodes = () => {
            nodesRef.current = [];
            const spacing = 80; // Distance between nodes
            const cols = Math.ceil(canvas.width / spacing) + 1;
            const rows = Math.ceil(canvas.height / spacing) + 1;

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const x = i * spacing;
                    const y = j * spacing;
                    nodesRef.current.push(new Node(x, y));
                }
            }
        };

        // Draw connections between nearby nodes
        const drawConnections = () => {
            const maxDistance = 120;

            for (let i = 0; i < nodesRef.current.length; i++) {
                for (let j = i + 1; j < nodesRef.current.length; j++) {
                    const nodeA = nodesRef.current[i];
                    const nodeB = nodesRef.current[j];

                    const dx = nodeA.x - nodeB.x;
                    const dy = nodeA.y - nodeB.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < maxDistance) {
                        const opacity = (1 - distance / maxDistance) * 0.15;
                        ctx.beginPath();
                        ctx.moveTo(nodeA.x, nodeA.y);
                        ctx.lineTo(nodeB.x, nodeB.y);
                        ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        };

        // Mouse/Touch move handler
        const handleMove = (e) => {
            const rect = canvas.getBoundingClientRect();

            if (e.type === 'touchmove') {
                e.preventDefault();
                const touch = e.touches[0];
                mouseRef.current.x = touch.clientX - rect.left;
                mouseRef.current.y = touch.clientY - rect.top;
            } else {
                mouseRef.current.x = e.clientX - rect.left;
                mouseRef.current.y = e.clientY - rect.top;
            }
        };

        // Mouse/Touch leave handler
        const handleLeave = () => {
            mouseRef.current.x = null;
            mouseRef.current.y = null;
        };

        // Animation loop
        const animate = () => {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw connections first (behind nodes)
            drawConnections();

            // Update and draw nodes
            nodesRef.current.forEach(node => {
                node.update();
                node.draw(ctx);
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        // Initialize nodes
        initNodes();

        // Event listeners
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('mouseleave', handleLeave);
        window.addEventListener('touchend', handleLeave);
        window.addEventListener('resize', resizeCanvas);

        // Start animation
        animate();

        // Cleanup
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('mouseleave', handleLeave);
            window.removeEventListener('touchend', handleLeave);
            window.removeEventListener('resize', resizeCanvas);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-10"
            style={{ opacity: 0.6 }}
        />
    );
};

export default CursorParticles;

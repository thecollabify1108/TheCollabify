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
        if (!ctx) return;

        // Node class defined outside loop for better performance and stability
        class Node {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.originalX = x;
                this.originalY = y;
                this.vx = 0;
                this.vy = 0;
            }

            update(mouseX, mouseY) {
                const springStrength = 0.01;
                const damping = 0.9;

                // Return to original position
                this.vx += (this.originalX - this.x) * springStrength;
                this.vy += (this.originalY - this.y) * springStrength;

                // Repel from cursor
                if (mouseX !== null && mouseY !== null) {
                    const dx = this.x - mouseX;
                    const dy = this.y - mouseY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const repulsionRadius = 150;

                    if (distance < repulsionRadius && distance > 0) {
                        const force = (repulsionRadius - distance) / repulsionRadius;
                        const angle = Math.atan2(dy, dx);
                        this.vx += Math.cos(angle) * force * 5; // Slightly stronger repulsion
                        this.vy += Math.sin(angle) * force * 5;
                    }
                }

                this.x += this.vx;
                this.y += this.vy;
                this.vx *= damping;
                this.vy *= damping;
            }

            draw(ctx) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, 1, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(139, 92, 246, 0.4)';
                ctx.fill();
            }
        }

        const initNodes = () => {
            const nodes = [];
            const spacing = 100; // Increased spacing to reduce node count (better performance)
            const cols = Math.ceil(canvas.width / spacing) + 1;
            const rows = Math.ceil(canvas.height / spacing) + 1;

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    nodes.push(new Node(i * spacing, j * spacing));
                }
            }
            nodesRef.current = nodes;
        };

        const resizeCanvas = () => {
            if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                initNodes();
            }
        };

        const handleMove = (e) => {
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();

            try {
                if (e.type === 'touchmove' || e.type === 'touchstart') {
                    const touch = e.touches[0];
                    if (touch) {
                        mouseRef.current.x = touch.clientX - rect.left;
                        mouseRef.current.y = touch.clientY - rect.top;
                    }
                } else {
                    mouseRef.current.x = e.clientX - rect.left;
                    mouseRef.current.y = e.clientY - rect.top;
                }
            } catch (err) {
                console.error("CursorParticles error in handleMove:", err);
            }
        };

        const handleLeave = () => {
            mouseRef.current.x = null;
            mouseRef.current.y = null;
        };

        const animate = () => {
            if (!ctx || !canvas) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const nodes = nodesRef.current;
            const mouse = mouseRef.current;
            const maxDistance = 150;

            // Draw connections
            ctx.lineWidth = 0.5;
            for (let i = 0; i < nodes.length; i++) {
                const nodeA = nodes[i];

                for (let j = i + 1; j < nodes.length; j++) {
                    const nodeB = nodes[j];
                    const dx = nodeA.x - nodeB.x;
                    const dy = nodeA.y - nodeB.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < maxDistance) {
                        const opacity = (1 - distance / maxDistance) * 0.2;
                        ctx.beginPath();
                        ctx.moveTo(nodeA.x, nodeA.y);
                        ctx.lineTo(nodeB.x, nodeB.y);
                        ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
                        ctx.stroke();
                    }
                }
            }

            // Update and draw nodes
            nodes.forEach(node => {
                node.update(mouse.x, mouse.y);
                node.draw(ctx);
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        resizeCanvas();
        animate();

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('touchmove', handleMove, { passive: true });
        window.addEventListener('touchstart', handleMove, { passive: true });
        window.addEventListener('mouseleave', handleLeave);
        window.addEventListener('touchend', handleLeave);
        window.addEventListener('resize', resizeCanvas);

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
            style={{ opacity: 0.8, pointerEvents: 'none' }}
        />
    );
};

export default CursorParticles;

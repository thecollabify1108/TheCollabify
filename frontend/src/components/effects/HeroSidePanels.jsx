import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const IntelligencePanel = ({ side, title, stats, children }) => {
    return (
        <motion.div
            initial={{ opacity: 0, z: -500, rotateY: side === 'left' ? 45 : -45 }}
            animate={{ opacity: 1, z: 0, rotateY: side === 'left' ? 15 : -15 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            className={`hidden lg:flex flex-col gap-4 p-6 glass-card w-72 h-96 absolute top-1/2 -translate-y-1/2 cursor-default preserve-3d
                ${side === 'left' ? 'left-[-15vw]' : 'right-[-15vw]'}
            `}
            style={{
                boxShadow: 'var(--elev-mid)',
                borderColor: 'rgba(255,255,255,0.1)'
            }}
        >
            <div className="flex flex-col gap-1 internal-parallax">
                <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-bold">Intelligence Preview</span>
                <h3 className="text-xl font-bold text-text-prime">{title}</h3>
            </div>

            <div className="flex-1 border-y border-white/5 py-4 my-2 overflow-hidden internal-parallax">
                {children}
            </div>

            <div className="grid grid-cols-2 gap-4 internal-parallax">
                {stats.map((stat, i) => (
                    <div key={i} className="flex flex-col">
                        <span className="text-[10px] text-text-muted uppercase font-bold">{stat.label}</span>
                        <span className="text-sm font-bold text-text-prime">{stat.value}</span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export const HeroSidePanels = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll();

    // Smoothly dissolve panels backward in depth as user scrolls
    const zDepth = useTransform(scrollYProgress, [0, 0.2], [0, -400]);
    const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

    return (
        <motion.div
            ref={containerRef}
            className="absolute inset-0 pointer-events-none z-0 overflow-visible"
            style={{ z: zDepth, opacity }}
        >
            <IntelligencePanel
                side="left"
                title="Protocol: Brand"
                stats={[
                    { label: 'Signal Quality', value: '99.4%' },
                    { label: 'Moat Strength', value: 'High' }
                ]}
            >
                <div className="space-y-3 opacity-60">
                    <div className="h-1 w-full bg-surface-3 rounded-full" />
                    <div className="h-1 w-2/3 bg-surface-3 rounded-full" />
                    <div className="h-1 w-full bg-surface-3 rounded-full" />
                    <div className="h-1 w-3/4 bg-surface-3 rounded-full" />
                    <div className="h-8 w-8 rounded-full border border-white/10 mt-4 mx-auto" />
                </div>
            </IntelligencePanel>

            <IntelligencePanel
                side="right"
                title="Protocol: Creator"
                stats={[
                    { label: 'Audience Trust', value: 'Verified' },
                    { label: 'Growth Vector', value: 'Exponential' }
                ]}
            >
                <div className="space-y-3 opacity-60">
                    <div className="h-1 w-full bg-surface-3 rounded-full" />
                    <div className="h-1 w-3/4 bg-surface-3 rounded-full" />
                    <div className="h-1 w-1/2 bg-surface-3 rounded-full" />
                    <div className="h-20 w-full border border-white/5 bg-surface-3/20 rounded-lg mt-4" />
                </div>
            </IntelligencePanel>
        </motion.div>
    );
};

export default HeroSidePanels;

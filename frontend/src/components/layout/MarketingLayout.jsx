import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../common/Logo';
import ThemeToggle from '../common/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

/**
 * MarketingLayout — Spatial container for all marketing pages.
 *
 * Structure:
 *  Z0  env-grain         — subtle noise overlay (CSS)
 *  Z0  env-radial        — top spotlight halo (CSS)
 *  Z2  FloatingNav pill  — z-nav
 *  Z1  children          — page content
 */

const navLinks = [
    { label: 'For Brands', path: '/for-brands' },
    { label: 'For Creators', path: '/for-creators' },
    { label: 'How It Works', path: '/ai-explained' },
    { label: 'Demo', path: '/demo' },
];

const FloatingNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();
    const { isDark } = useTheme();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const dashboardPath = user?.role === 'creator'
        ? '/creator/dashboard'
        : user?.role === 'seller'
            ? '/seller/dashboard'
            : '/admin';

    return (
        <div
            className="fixed top-0 left-0 right-0 z-[100] flex justify-center pointer-events-none"
            style={{ paddingTop: scrolled ? '0.75rem' : '1.25rem', transition: 'padding 500ms var(--ease-out-expo)' }}
        >
            <motion.nav
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-auto nav-pill flex items-center gap-1 px-3 py-2"
                style={{ maxWidth: '960px', width: 'calc(100% - 2rem)' }}
                aria-label="Main navigation"
            >
                {/* Logo */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 mr-3 min-tap-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded-full"
                    aria-label="Home"
                >
                    <Logo className="h-6 w-auto grayscale brightness-150" />
                    <span className="text-[11px] font-black uppercase tracking-[0.25em] hidden sm:block" style={{ color: 'var(--text-prime)' }}>
                        Collabify
                    </span>
                </button>

                {/* Nav links — hidden on small screens */}
                <div className="hidden md:flex items-center gap-0.5 flex-1">
                    {navLinks.map(({ label, path }) => {
                        const active = location.pathname === path;
                        return (
                            <button
                                key={path}
                                onClick={() => navigate(path)}
                                className="px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.2em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                                style={{
                                    color: active ? 'var(--text-prime)' : 'var(--text-muted)',
                                    background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                                }}
                                aria-current={active ? 'page' : undefined}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-1 ml-auto">
                    <ThemeToggle />
                    {isAuthenticated ? (
                        <button
                            onClick={() => navigate(dashboardPath)}
                            className="px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] btn-executive min-tap-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                        >
                            Dashboard
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => navigate('/login')}
                                className="px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors duration-200 hidden sm:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                Sign in
                            </button>
                            <button
                                onClick={() => navigate('/register')}
                                className="px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] btn-executive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                            >
                                Get access
                            </button>
                        </>
                    )}
                </div>
            </motion.nav>
        </div>
    );
};

/**
 * MarketingLayout wraps marketing pages with the spatial environment.
 * Pass children as page content.
 */
const MarketingLayout = ({ children }) => {
    return (
        <div className="relative min-h-screen font-sans overflow-x-hidden" style={{ background: 'var(--bg-prime)', color: 'var(--text-prime)' }}>
            {/* Z0: Environment grain */}
            <div className="env-grain" aria-hidden="true" />
            {/* Z0: Environment spotlight halo */}
            <div className="env-radial" aria-hidden="true" />

            {/* Z2: Floating pill nav */}
            <FloatingNav />

            {/* Z1: Page content */}
            <main>
                {children}
            </main>
        </div>
    );
};

export default MarketingLayout;

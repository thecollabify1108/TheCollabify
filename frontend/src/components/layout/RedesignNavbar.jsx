import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const RedesignNavbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Intelligence', path: '/preview/landing' },
        { name: 'For Brands', path: '/preview/brands' },
        { name: 'For Creators', path: '/preview/creators' },
        { name: 'Dashboard', path: '/preview/dashboard' },
    ];

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-12 py-6 flex justify-between items-center ${scrolled ? 'bg-bg-base/80 backdrop-blur-md border-b border-border-subtle py-4' : 'bg-transparent'
                }`}
        >
            {/* Logo */}
            <Link to="/preview/landing" className="flex items-center space-x-2 group">
                <div className="w-8 h-8 rounded-lg bg-primary-accent group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-primary-accent/20" />
                <span className="text-xl font-bold tracking-tight">AI LAB</span>
            </Link>

            {/* Nav Links */}
            <div className="flex space-x-12">
                {navLinks.map((link) => (
                    <Link
                        key={link.name}
                        to={link.path}
                        className={`text-sm font-medium tracking-wide transition-colors ${location.pathname === link.path ? 'text-primary-accent' : 'text-dark-400 hover:text-white'
                            }`}
                    >
                        {link.name}
                    </Link>
                ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-8">
                <Link to="/login" className="text-sm font-medium text-dark-300 hover:text-white">Login</Link>
                <button className="btn-primary-spatial py-2 px-6 text-sm">
                    Start Matching
                </button>
            </div>
        </motion.nav>
    );
};

export default RedesignNavbar;

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThemeToggle from '../common/ThemeToggle';
import { HiStar, HiCheckCircle } from 'react-icons/hi';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen bg-dark-950 flex">
            {/* Left Side - Visual (Desktop Only) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-dark-900 border-r border-dark-800">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 to-secondary-900/40" />
                    <div className="grid-pattern" />
                </div>

                {/* Animated Orbs */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl mix-blend-screen"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 10, repeat: Infinity, delay: 1 }}
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/30 rounded-full blur-3xl mix-blend-screen"
                />

                {/* Content */}
                <div className="relative z-10 w-full flex flex-col justify-between p-12">
                    {/* Logo Area */}
                    <div>
                        <Link to="/" className="inline-flex items-center space-x-3 group">
                            <img src="/favicon.png" alt="TheCollabify" className="w-10 h-10 object-contain" />
                            <span className="text-2xl font-bold text-white tracking-tight">TheCollabify</span>
                        </Link>
                    </div>

                    {/* Main Showcase Text */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h2 className="text-5xl font-extrabold leading-tight mb-6">
                                <span className="text-white">Connect.</span> <br />
                                <span className="text-white">Collaborate.</span> <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">Create Magic.</span>
                            </h2>
                            <p className="text-xl text-dark-300 max-w-md leading-relaxed">
                                The #1 AI-powered marketplace connecting premium brands with authentic creators.
                            </p>
                        </motion.div>

                        {/* Social Proof Pills */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex flex-col space-y-4"
                        >
                            <div className="flex items-center space-x-3 bg-dark-800/50 backdrop-blur-sm p-3 rounded-xl border border-dark-700 w-fit">
                                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                                    <HiCheckCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-white font-bold">98% Match Rate</p>
                                    <p className="text-xs text-dark-400">AI-powered precision</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Footer / Copyright */}
                    <div className="flex items-center justify-between text-sm text-dark-400 border-t border-dark-800 pt-6">
                        <p>&copy; 2026 TheCollabify Inc.</p>
                        <div className="flex space-x-4">
                            <Link to="/terms" className="hover:text-white transition">Privacy</Link>
                            <Link to="/terms" className="hover:text-white transition">Terms</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col relative bg-dark-950">
                {/* Navbar for Mobile / Tools for Desktop */}
                <div className="absolute top-0 right-0 p-6 flex items-center gap-4 z-20">
                    <ThemeToggle />
                </div>

                <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-24 overflow-y-auto w-full">
                    <div className="w-full max-w-md space-y-8">
                        {/* Mobile Logo (Visible only on small screens) */}
                        <div className="lg:hidden text-center mb-8">
                            <Link to="/" className="inline-flex items-center space-x-2">
                                <img src="/favicon.png" alt="Logo" className="w-10 h-10 object-contain" />
                                <span className="text-xl font-bold text-dark-100">TheCollabify</span>
                            </Link>
                        </div>

                        {/* Header Text */}
                        <div className="text-center lg:text-left">
                            <h1 className="text-3xl lg:text-4xl font-bold text-dark-100 mb-3">{title}</h1>
                            {subtitle && <p className="text-dark-400 text-lg">{subtitle}</p>}
                        </div>

                        {/* The Form Content */}
                        <div className="mt-8">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;

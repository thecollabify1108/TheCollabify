import { motion } from 'framer-motion';
import { HiSparkles } from 'react-icons/hi';

const DashboardHero = ({ userName, role, dailyInsight }) => {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl p-6 md:p-8 bg-gradient-to-r from-violet-600 to-indigo-600 relative overflow-hidden"
        >
            <div className="relative z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-2 mb-2"
                        >
                            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium text-white backdrop-blur-sm border border-white/10 uppercase tracking-wider">
                                {role} Dashboard
                            </span>
                        </motion.div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                            {getGreeting()}, {userName}! 👋
                        </h1>
                        <p className="text-indigo-100 max-w-lg">
                            Ready to achieve your goals today? Check out your personalized insights below.
                        </p>
                    </div>
                    <div className="hidden md:block">
                        {/* 3D-ish Avatar or Icon could go here */}
                    </div>
                </div>

                {dailyInsight && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mt-6 p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-start gap-3 max-w-xl"
                    >
                        <div className="bg-white/20 p-2 rounded-lg text-yellow-300">
                            <HiSparkles className="text-xl" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-white text-sm">AI Daily Insight</h4>
                            <p className="text-white/80 text-sm mt-1">{dailyInsight}</p>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Decorative circles */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-black/10 blur-3xl" />
        </motion.div>
    );
};

export default DashboardHero;

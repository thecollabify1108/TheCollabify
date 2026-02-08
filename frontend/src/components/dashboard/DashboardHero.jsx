const DashboardHero = ({ userName, role, dailyInsight, availabilityStatus, onToggleAvailability }) => {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    const getInsight = () => {
        if (dailyInsight) return dailyInsight;
        // ... (rest of the function)
    };

    const getAvailabilityInfo = (status) => {
        switch (status) {
            case 'AVAILABLE_NOW':
                return { label: 'Available Now', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
            case 'LIMITED_AVAILABILITY':
                return { label: 'Limited', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
            case 'NOT_AVAILABLE':
                return { label: 'Not Available', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
            default:
                return { label: 'Online', color: 'bg-white/20 text-white border-white/10' };
        }
    };

    const availInfo = getAvailabilityInfo(availabilityStatus);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl p-5 md:p-8 bg-gradient-to-r from-violet-600 to-indigo-600 relative overflow-hidden shadow-2xl shadow-indigo-500/20"
        >
            <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium text-white backdrop-blur-sm border border-white/10 uppercase tracking-wider flex items-center gap-1">
                                    <HiSparkles className="text-yellow-300" />
                                    {role} Dashboard
                                </span>
                            </motion.div>

                            {onToggleAvailability && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onToggleAvailability}
                                    className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm transition-all flex items-center gap-1.5 ${availInfo.color}`}
                                >
                                    <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                                    {availInfo.label}
                                </motion.button>
                            )}
                        </div>
                        <h1 className="text-2xl md:text-4xl font-bold text-white mb-3 leading-tight">
                            {getGreeting()}, {userName}! 👋
                        </h1>
                        <p className="text-indigo-100 max-w-lg text-lg">
                            Ready to make an impact? Here's your daily edge.
                        </p>
                    </div>

                    {/* AI Insight Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-start gap-4 max-w-md hover:bg-white/15 transition-colors cursor-default group"
                    >
                        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2.5 rounded-xl text-white shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform duration-300">
                            <HiSparkles className="text-xl" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm flex items-center gap-2">
                                Today's AI Insight
                                <span className="px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-medium tracking-wide">DAILY</span>
                            </h4>
                            <p className="text-indigo-50 text-sm mt-1 leading-relaxed">
                                "{dailyInsight || "Complete your profile to increase visibility! 🌟"}"
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Decorative circles */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-black/10 blur-3xl" />
        </motion.div>
    );
};

export default DashboardHero;

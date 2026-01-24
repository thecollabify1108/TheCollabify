import { motion } from 'framer-motion';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import { FaUsers, FaArrowUp, FaArrowDown, FaMoneyBillWave, FaBullhorn, FaCheckCircle } from 'react-icons/fa';
import AnimatedCounter from '../common/AnimatedCounter';

const AdminDashboard = ({ stats, loading }) => {
    if (loading || !stats) {
        return <div className="animate-pulse space-y-4">
            <div className="h-32 bg-dark-800 rounded-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="h-40 bg-dark-800 rounded-2xl"></div>
                <div className="h-40 bg-dark-800 rounded-2xl"></div>
                <div className="h-40 bg-dark-800 rounded-2xl"></div>
            </div>
        </div>;
    }

    // Use real stats or default to 0/empty
    const growthData = stats.growth || []; // Assuming backend might provide this later, otherwise empty
    const distributionData = [
        { name: 'Creators', value: stats.users?.creators || 0 },
        { name: 'Brands', value: stats.users?.sellers || 0 },
    ].filter(d => d.value > 0);

    const COLORS = ['#8b5cf6', '#ec4899']; // Primary, Secondary

    const StatCard = ({ title, value, subtext, icon: Icon, color, trend }) => (
        <motion.div
            whileHover={{ y: -5 }}
            className="glass-card p-6 relative overflow-hidden"
        >
            <div className={`absolute top-0 right-0 p-4 opacity-10 text-9xl -mr-8 -mt-8 ${color}`}>
                <Icon />
            </div>

            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <h3 className="text-dark-400 font-medium mb-1">{title}</h3>
                    <div className="text-3xl font-bold text-dark-100 mb-2">
                        <AnimatedCounter end={value || 0} />
                    </div>
                </div>
                <div className={`p-3 rounded-xl bg-dark-950/30 ${color}`}>
                    <Icon className="text-xl" />
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats.users?.total || 0}
                    icon={FaUsers}
                    color="text-primary-500"
                />
                <StatCard
                    title="Active Campaigns"
                    value={stats.requests?.active || 0}
                    icon={FaBullhorn}
                    color="text-secondary-500"
                />
                <StatCard
                    title="Total Revenue"
                    value={stats.revenue || 0} // Real data only
                    icon={FaMoneyBillWave}
                    color="text-emerald-500"
                />
                <StatCard
                    title="Success Rate"
                    value={stats.successRate || 0} // Real data only
                    icon={FaCheckCircle}
                    color="text-amber-500"
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Growth Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 lg:col-span-2"
                >
                    <h3 className="text-lg font-bold text-dark-100 mb-6">Platform Growth</h3>
                    {growthData.length > 0 ? (
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={growthData}>
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                                    <XAxis dataKey="name" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                        itemStyle={{ color: '#e2e8f0' }}
                                    />
                                    <Area type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                                    <Area type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-80 flex items-center justify-center text-dark-400 bg-dark-800/20 rounded-2xl border border-dark-800 border-dashed">
                            No growth data available yet.
                        </div>
                    )}
                </motion.div>

                {/* Distribution Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-6"
                >
                    <h3 className="text-lg font-bold text-dark-100 mb-6">User Distribution</h3>
                    {distributionData.length > 0 ? (
                        <div className="h-80 flex flex-col items-center justify-center relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={distributionData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {distributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Stats */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
                                <div className="text-2xl font-bold text-dark-100">{stats.users?.total || 0}</div>
                                <div className="text-xs text-dark-400">Total</div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-80 flex items-center justify-center text-dark-400 bg-dark-800/20 rounded-2xl border border-dark-800 border-dashed">
                            No user data available.
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboard;

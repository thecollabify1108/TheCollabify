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

    // Mock Data for Charts (Simulating backend data for visualization)
    const growthData = [
        { name: 'Mon', users: 400, revenue: 2400 },
        { name: 'Tue', users: 300, revenue: 1398 },
        { name: 'Wed', users: 200, revenue: 9800 },
        { name: 'Thu', users: 278, revenue: 3908 },
        { name: 'Fri', users: 189, revenue: 4800 },
        { name: 'Sat', users: 239, revenue: 3800 },
        { name: 'Sun', users: 349, revenue: 4300 },
    ];

    const distributionData = [
        { name: 'Creators', value: stats.users.creators },
        { name: 'Brands', value: stats.users.sellers },
    ];

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
                        <AnimatedCounter end={value} />
                    </div>
                    <div className={`flex items-center text-xs font-semibold ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trend > 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                        {Math.abs(trend)}% from last week
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
                    value={stats.users.total}
                    icon={FaUsers}
                    color="text-primary-500"
                    trend={12}
                />
                <StatCard
                    title="Active Campaigns"
                    value={stats.requests.active}
                    icon={FaBullhorn}
                    color="text-secondary-500"
                    trend={8}
                />
                <StatCard
                    title="Total Revenue"
                    value={24500}
                    icon={FaMoneyBillWave}
                    color="text-emerald-500"
                    trend={24}
                />
                <StatCard
                    title="Success Rate"
                    value={98}
                    icon={FaCheckCircle}
                    color="text-amber-500"
                    trend={2}
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
                </motion.div>

                {/* Distribution Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-6"
                >
                    <h3 className="text-lg font-bold text-dark-100 mb-6">User Distribution</h3>
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
                            <div className="text-2xl font-bold text-dark-100">{stats.users.total}</div>
                            <div className="text-xs text-dark-400">Total</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboard;

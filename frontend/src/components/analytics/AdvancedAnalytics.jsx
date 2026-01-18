import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

/**
 * AdvancedAnalytics - Professional-grade interactive charts
 * Requires Recharts library: npm install recharts
 */

// Custom Tooltip with Glassmorphism
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-4 border border-primary-500/20"
            >
                <p className="text-dark-100 font-semibold mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <p className="text-dark-300 text-sm">
                            {entry.name}: <span className="font-semibold text-dark-100">{entry.value}</span>
                        </p>
                    </div>
                ))}
            </motion.div>
        );
    }
    return null;
};

/**
 * GrowthChart - Area chart for growth metrics
 */
export const GrowthChart = ({ data, title = "Growth Analytics" }) => {
    return (
        <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-dark-100 mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorGradient2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EC4899" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
                    <XAxis
                        dataKey="date"
                        stroke="#666"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        stroke="#666"
                        style={{ fontSize: '12px' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="applications"
                        stroke="#8B5CF6"
                        fillOpacity={1}
                        fill="url(#colorGradient)"
                        animationDuration={2000}
                        strokeWidth={2}
                    />
                    <Area
                        type="monotone"
                        dataKey="collaborations"
                        stroke="#EC4899"
                        fillOpacity={1}
                        fill="url(#colorGradient2)"
                        animationDuration={2000}
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

/**
 * PerformanceChart - Multi-line chart for performance tracking
 */
export const PerformanceChart = ({ data, title = "Performance Metrics" }) => {
    return (
        <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-dark-100 mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
                    <XAxis
                        dataKey="month"
                        stroke="#666"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        stroke="#666"
                        style={{ fontSize: '12px' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ fontSize: '12px', color: '#999' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="engagement"
                        stroke="#8B5CF6"
                        strokeWidth={3}
                        dot={{ fill: '#8B5CF6', r: 5 }}
                        activeDot={{ r: 8 }}
                        animationDuration={2000}
                    />
                    <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10B981"
                        strokeWidth={3}
                        dot={{ fill: '#10B981', r: 5 }}
                        activeDot={{ r: 8 }}
                        animationDuration={2000}
                    />
                    <Line
                        type="monotone"
                        dataKey="reach"
                        stroke="#F59E0B"
                        strokeWidth={3}
                        dot={{ fill: '#F59E0B', r: 5 }}
                        activeDot={{ r: 8 }}
                        animationDuration={2000}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

/**
 * CampaignStatsBar - Bar chart for campaign statistics
 */
export const CampaignStatsBar = ({ data, title = "Campaign Stats" }) => {
    return (
        <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-dark-100 mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
                    <XAxis
                        dataKey="category"
                        stroke="#666"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        stroke="#666"
                        style={{ fontSize: '12px' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                        dataKey="active"
                        fill="#8B5CF6"
                        radius={[8, 8, 0, 0]}
                        animationDuration={2000}
                    />
                    <Bar
                        dataKey="completed"
                        fill="#10B981"
                        radius={[8, 8, 0, 0]}
                        animationDuration={2000}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default { GrowthChart, PerformanceChart, CampaignStatsBar };

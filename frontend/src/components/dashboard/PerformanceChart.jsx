import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

const PerformanceChart = ({ data, title, color = "#6366f1" }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-premium-xl bg-dark-800/40 border border-dark-700/50 p-s5 backdrop-blur-sm h-full flex flex-col shadow-md"
        >
            <div className="mb-s4">
                <h3 className="text-h3 font-bold text-white uppercase tracking-wider">{title}</h3>
            </div>

            <div className="flex-1" style={{ minHeight: 200, minWidth: 200 }}>
                {(!data || data.length === 0) ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-dark-500">
                        <div className="w-14 h-14 rounded-full bg-dark-700/50 flex items-center justify-center text-3xl leading-none flex-shrink-0">📊</div>
                        <div className="text-center">
                            <p className="text-xs font-medium uppercase tracking-wider">No data yet</p>
                            <p className="text-[10px] text-dark-600 mt-1">Analytics will appear once campaigns run</p>
                        </div>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%" minHeight={200} minWidth={200}>
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#9ca3af"
                                tick={{ fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="#9ca3af"
                                tick={{ fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                dx={-10}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)' }}
                                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                cursor={{ stroke: color, strokeWidth: 1 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={color}
                                strokeWidth={3}
                                fillOpacity={1}
                                fill={`url(#gradient-${title})`}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </motion.div>
    );
};

export default PerformanceChart;

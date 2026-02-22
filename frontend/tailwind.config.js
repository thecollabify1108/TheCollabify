/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f4ff',
                    100: '#e0e9ff',
                    200: '#c7d6fe',
                    300: '#a4b8fc',
                    400: '#818cf8',
                    500: '#6366f1',
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                },
                secondary: {
                    50: '#fdf4ff',
                    100: '#fae8ff',
                    200: '#f5d0fe',
                    300: '#f0abfc',
                    400: '#e879f9',
                    500: '#d946ef',
                    600: '#c026d3',
                    700: '#a21caf',
                    800: '#86198f',
                    900: '#701a75',
                },
                dark: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',      // Solid dark slate
                    800: '#1e293b',      // Solid darker slate
                    900: '#0f172a',      // Solid very dark slate
                    950: '#020617',      // Solid almost black
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'gradient': 'gradient 8s ease infinite',
                'shimmer': 'shimmer 2s linear infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                gradient: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                }
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
            boxShadow: {
                'glow': 'var(--shadow-glow)',
                'glow-lg': '0 0 40px rgba(99, 102, 241, 0.4)',
                '3d': '0 10px 30px -10px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
                'low': 'var(--shadow-low)',
                'md': 'var(--shadow-md)',
                'high': 'var(--shadow-high)',
                'premium': 'var(--shadow-premium)',
            },
            spacing: {
                's1': 'var(--space-1)',
                's1.5': 'var(--space-1-5)',
                's2': 'var(--space-2)',
                's3': 'var(--space-3)',
                's4': 'var(--space-4)',
                's5': 'var(--space-5)',
                's6': 'var(--space-6)',
                's8': 'var(--space-8)',
                's12': 'var(--space-12)',
            },
            borderRadius: {
                'premium-sm': 'var(--radius-sm)',
                'premium-md': 'var(--radius-md)',
                'premium-lg': 'var(--radius-lg)',
                'premium-xl': 'var(--radius-xl)',
                'premium-2xl': 'var(--radius-2xl)',
            },
            fontSize: {
                'h1': ['var(--text-h1)', { lineHeight: 'var(--leading-tight)', fontWeight: '800' }],
                'h2': ['var(--text-h2)', { lineHeight: 'var(--leading-tight)', fontWeight: '700' }],
                'h3': ['var(--text-h3)', { lineHeight: 'var(--leading-tight)', fontWeight: '700' }],
                'body': ['var(--text-body)', { lineHeight: 'var(--leading-normal)' }],
                'small': ['var(--text-small)', { lineHeight: 'var(--leading-normal)' }],
                'xs-pure': ['var(--text-xs)', { lineHeight: 'var(--leading-tight)' }],
            }
        },
    },
    plugins: [],
}

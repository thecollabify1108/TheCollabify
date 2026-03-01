// Version: 3.0.0 - Performance Optimized
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true
            }
        }
    },
    build: {
        chunkSizeWarningLimit: 600,
        target: 'es2020',
        minify: 'esbuild',
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-motion': ['framer-motion'],
                    'vendor-charts': ['recharts', 'chart.js', 'react-chartjs-2'],
                    'vendor-utils': ['axios', 'axios-retry', 'date-fns'],
                    'vendor-icons': ['react-icons'],
                }
            }
        }
    }
})

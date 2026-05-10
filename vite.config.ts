import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
    base: '/finnaflow/',
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
            manifest: {
                name: 'FinnaFlow',
                short_name: 'FinnaFlow',
                description: 'Privacy-First Financial Flow Visualizer',
                theme_color: '#ffffff',
                icons: [
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: 'logo.svg',
                        sizes: '512x512',
                        type: 'image/svg+xml',
                        purpose: 'any maskable'
                    }
                ]
            }
        })
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks(id: string) {
                    if (id.includes('/node_modules/plotly') || id.includes('/node_modules/react-plotly')) {
                        return 'vendor-plotly';
                    }
                    if (id.includes('/node_modules/recharts')) {
                        return 'vendor-recharts';
                    }
                    if (id.includes('/node_modules/jspdf') || id.includes('/node_modules/html2canvas')) {
                        return 'vendor-pdf';
                    }
                    if (id.includes('/node_modules/lucide-react') || id.includes('/node_modules/zustand')) {
                        return 'vendor-utils';
                    }
                }
            }
        },
        chunkSizeWarningLimit: 1000,
    }
});


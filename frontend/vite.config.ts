// 
// 
import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
    plugins: [
      react(), 
      tailwindcss()
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
        extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.scss'],
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    // Vendor libraries
                    'vendor-ui': [
                        '@radix-ui/react-dialog',
                        '@radix-ui/react-alert-dialog',
                        '@radix-ui/react-dropdown-menu',
                        '@radix-ui/react-select',
                        '@radix-ui/react-tabs',
                        '@radix-ui/react-tooltip',
                    ],
                    'vendor-ui-other': [
                        '@radix-ui/react-avatar',
                        '@radix-ui/react-checkbox',
                        '@radix-ui/react-collapsible',
                        '@radix-ui/react-label',
                        '@radix-ui/react-popover',
                        '@radix-ui/react-separator',
                        '@radix-ui/react-slot',
                        '@radix-ui/react-switch',
                    ],
                    'vendor-core': [
                        'react',
                        'react-dom',
                        'react-router-dom',
                    ],
                    'vendor-utils': [
                        '@tanstack/react-query',
                        '@tanstack/react-table',
                        'axios',
                        'class-variance-authority',
                        'clsx',
                        'date-fns',
                        'tailwind-merge',
                    ],
                    'vendor-ui-libs': [
                        'lucide-react',
                        'react-hot-toast',
                        'react-number-format',
                        'sonner',
                    ],
                }
            }
        },
        chunkSizeWarningLimit: 1000,
    }
})

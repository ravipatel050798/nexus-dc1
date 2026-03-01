/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'nexus-bg': '#0a0f1c',
                'nexus-sidebar': '#0d1425',
                'nexus-card': 'rgba(30, 41, 59, 0.4)',
                'nexus-border': 'rgba(255, 255, 255, 0.05)',
                'well-green': '#22c55e',
                'well-red': '#ef4444',
                'well-blue': '#3b82f6',
                'well-yellow': '#f59e0b',
            },
            backgroundImage: {
                'nexus-gradient': 'linear-gradient(135deg, #0d1425 0%, #0a0f1c 100%)',
                'well-glow': 'radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%)',
            },
            boxShadow: {
                'well-neon': '0 0 15px rgba(34, 197, 94, 0.3)',
            },
            animation: {
                'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        },
    },
    plugins: [],
}

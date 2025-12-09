/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                deep: {
                    bg: '#1a1a1a',
                    surface: '#2a2a2a',
                    primary: '#8b5cf6', // Violet-500
                    secondary: '#10b981', // Emerald-500
                    accent: '#f43f5e', // Rose-500
                    text: '#e5e5e5',
                    muted: '#a3a3a3',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
        },
    },
    plugins: [],
}

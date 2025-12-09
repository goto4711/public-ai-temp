/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                main: '#832161', // Deep Magenta
                'main-hover': '#66184a',
                secondary: '#2874fc', // Deep Blue
                bg: '#f8f9fa', // Light gray background
                surface: '#ffffff', // White cards
                text: '#2c3e50', // Dark text
                'text-muted': '#6c757d',
                border: 'rgba(0,0,0,0.05)',
            },
            fontFamily: {
                sans: ['Lexend', 'sans-serif'],
            },
            boxShadow: {
                'card': '0 4px 20px rgba(0,0,0,0.02)',
            }
        },
    },
    plugins: [],
}

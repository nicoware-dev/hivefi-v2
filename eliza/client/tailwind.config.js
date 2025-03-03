/** @type {import('tailwindcss').Config} */
import animate from "tailwindcss-animate";

export default {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        container: {
            center: true,
            padding: {
                DEFAULT: '1rem',
                sm: '2rem',
                lg: '4rem',
                xl: '5rem',
                '2xl': '6rem',
            },
            screens: {
                sm: '640px',
                md: '768px',
                lg: '1024px',
                xl: '1280px',
                '2xl': '1536px',
            },
        },
        extend: {
            fontFamily: {
                sans: ['"Space Grotesk"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
            },
            colors: {
                // Brand Colors
                brand: {
                    dark: '#4a0080',    // Dark purple
                    primary: '#7f00ff', // Main purple
                    secondary: '#ff1492', // Pink
                    accent: '#7b4bd2',  // Light purple
                },
                // Theme Colors
                background: {
                    DEFAULT: '#0A0A0A', // Main background
                    secondary: '#121212', // Secondary background
                },
                foreground: {
                    DEFAULT: '#FFFFFF',
                    secondary: '#A1A1AA',
                },
                // UI Elements
                primary: {
                    DEFAULT: '#7f00ff',
                    foreground: '#FFFFFF',
                },
                secondary: {
                    DEFAULT: '#ff1492',
                    foreground: '#FFFFFF',
                },
                muted: {
                    DEFAULT: '#27272A',
                    foreground: '#A1A1AA',
                },
                accent: {
                    DEFAULT: '#7b4bd2',
                    foreground: '#FFFFFF',
                },
                destructive: {
                    DEFAULT: '#FF5555',
                    foreground: '#FFFFFF',
                },
                // Borders and inputs
                border: '#27272A',
                input: '#27272A',
                ring: {
                    DEFAULT: '#7f00ff',
                    focus: '#7f00ff',
                },
                // Chart colors
                chart: {
                    1: '#7f00ff', // Purple
                    2: '#ff1492', // Pink
                    3: '#7b4bd2', // Light purple
                    4: '#4a0080', // Dark purple
                    5: '#ff00ff', // Magenta
                },
            },
            borderRadius: {
                lg: "0.75rem",
                md: "0.5rem",
                sm: "0.25rem",
            },
        },
    },
    plugins: [animate],
};

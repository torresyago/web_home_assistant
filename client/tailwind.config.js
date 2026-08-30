/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: {
          950: '#0a0e14',
          900: '#0f1420',
          800: '#161c2b',
          700: '#1f2738',
          600: '#2a3448',
        },
        accent: {
          400: '#5eead4',
          500: '#2dd4bf',
          600: '#14b8a6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(45, 212, 191, 0.15), 0 8px 24px -4px rgba(45, 212, 191, 0.15)',
      },
    },
  },
  plugins: [],
};

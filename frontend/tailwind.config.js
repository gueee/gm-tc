/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        steel: {
          300: '#a8b8c8',
          400: '#8a9aaa',
          500: '#6b7a8a',
          600: '#4d5d6d',
          700: '#2d3e52',
          800: '#1f2937',
          900: '#1a2332',
        },
        copper: {
          200: '#f0d9c4',
          300: '#e6c9a8',
          400: '#D4A574',
          500: '#c4956a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: '#11152F',
        deep: '#0B0E24',
        space: '#7655D9',
        violet: '#A78BFA',
        jred: '#C92838',
        sand: '#E8C99B',
        cream: '#FFF6E8',
        turq: '#48D6CB',
        ink: '#231B45',
      },
      fontFamily: {
        sans: ['"Cairo Variable"', 'Cairo', 'Tajawal', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 18px 40px -18px rgba(5, 6, 24, 0.9)',
        glow: '0 0 40px -6px rgba(167, 139, 250, 0.55)',
      },
    },
  },
  plugins: [],
};

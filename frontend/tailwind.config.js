/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0E1526',
        panel: '#161F35',
        panel2: '#1C2740',
        gold: '#C9A24B',
        'gold-soft': '#E4C77A',
        paper: '#F4F1E9',
        muted: '#8B93A7',
        hair: '#2A3552',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

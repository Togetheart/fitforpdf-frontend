/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,mjs,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#DC2626',
          hover: '#B91C1C',
          light: 'rgba(220, 38, 38, 0.10)',
        },
        cta: {
          DEFAULT: '#1A1A1A',
          hover: '#374151',
          text: '#FFFFFF',
        },
        hero: '#FAF8F5',
      },
      fontFamily: {
        sans: ['Satoshi', '-apple-system', 'SF Pro Display', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        xl: '14px',
      },
    },
  },
  plugins: [],
};

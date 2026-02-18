/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,mjs,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#0071E3',
          hover: '#005BBB',
          light: 'rgba(0, 113, 227, 0.10)',
        },
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

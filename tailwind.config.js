/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,mjs,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          muted: 'rgba(37, 99, 235, 0.4)',
        },
        warm: '#FAF8F5',
        muted: '#64748B',
      },
      fontFamily: {
        sans: ['Satoshi', '-apple-system', 'SF Pro Display', 'Segoe UI', 'sans-serif'],
      },
      maxWidth: {
        content: '1200px',
        narrow: '860px',
      },
      borderRadius: {
        xl: '16px',
      },
    },
  },
  plugins: [],
};

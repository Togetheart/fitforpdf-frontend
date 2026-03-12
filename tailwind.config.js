/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,mjs,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#0F172A',
          hover: '#1E293B',
          light: 'rgba(15, 23, 42, 0.10)',
        },
        cta: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          text: '#FFFFFF',
        },
        hero: '#FAF8F5',
        muted: '#64748B',
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

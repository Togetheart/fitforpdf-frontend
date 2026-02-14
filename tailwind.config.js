/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,mjs,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: '#D92D2A',
      },
      borderRadius: {
        xl: '14px',
      },
    },
  },
  plugins: [],
};

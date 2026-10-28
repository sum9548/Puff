/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Baloo 2', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif']
      },
      colors: {
        puff: { bg: '#10111b', panel: '#191b2b', purple: '#a99bff', mint: '#74f0c0' }
      },
      boxShadow: { glow: '0 0 50px rgba(169,155,255,.16)' }
    }
  },
  plugins: []
};

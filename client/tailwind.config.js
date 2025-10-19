/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#a7f3d0',
          DEFAULT: '#10b981',
          dark: '#047857',
        },
      },
    },
  },
  plugins: [],
};

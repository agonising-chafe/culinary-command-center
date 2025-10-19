export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#059669', // emerald
          light: '#10b981',
          dark: '#047857',
        },
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        ccc: {
          "primary": "#059669",
          "primary-content": "#ffffff",
          "secondary": "#10b981",
          "accent": "#047857",
          "base-100": "#ffffff",
        },
      },
      "light",
    ],
  },
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#007366', // GITAM Tropical Rain Forest
          hover: '#00594C',
        },
        secondary: {
          DEFAULT: '#F0E0C1', // GITAM Chamois
        },
        accent: {
          DEFAULT: '#E33A0C', // GITAM Trinidad Red
        },
        background: '#FFFFFF',
        text: '#1A1A1A',
        border: '#EDEDED',
      }
    },
  },
  plugins: [],
}

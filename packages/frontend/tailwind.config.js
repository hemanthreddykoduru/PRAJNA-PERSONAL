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
        surface: '#F8F9FA',    // Light gray for panels
        border: '#EDEDED',
        text: '#1A1A1A',
        textMuted: '#6B7280',  // Gray 500
      }
    },
  },
  plugins: [],
}

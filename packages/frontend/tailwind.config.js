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
          DEFAULT: '#00BD97', // Light Sea Green
          hover: '#008A7C',   // Teal
        },
        secondary: {
          DEFAULT: '#F0E0C1', // GITAM Chamois
        },
        accent: {
          DEFAULT: '#E33A0C', // GITAM Trinidad Red
        },
        background: '#0B121E', // Very dark slate (Black)
        surface: '#121B2B',    // Dark Slate
        border: '#1D2635',     // Dark Slate Gray
        text: '#F0F4F5',       // White Smoke
        textMuted: '#8AA2A8',  // Dark Gray
      }
    },
  },
  plugins: [],
}

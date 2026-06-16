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
          DEFAULT: '#10B981', // Emerald green
          hover: '#059669',
        },
        secondary: {
          DEFAULT: '#334155', // Slate 700
        },
        accent: {
          DEFAULT: '#3B82F6', // Blue 500
        },
        background: '#0F172A', // Slate 900
        surface: '#1E293B',    // Slate 800
        border: '#334155',     // Slate 700
        text: '#F8FAFC',       // Slate 50
        textMuted: '#94A3B8',  // Slate 400
      }
    },
  },
  plugins: [],
}

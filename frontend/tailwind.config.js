/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#10b981', // Emerald 500
        secondary: '#3b82f6', // Blue 500
        accent: '#f59e0b', // Amber 500
        background: '#f9fafb', // Gray 50
        surface: '#ffffff',
      }
    },
  },
  plugins: [],
}

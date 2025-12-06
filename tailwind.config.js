/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}", // Perhatikan ini: scan folder app
    "./components/**/*.{js,jsx}", // scan folder components
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0d9488", // Teal 600
        secondary: "#a855f7", // Purple 500
        dark: "#0f172a", // Slate 900
        card: "#1e293b", // Slate 800
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
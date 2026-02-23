/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {

      colors: {
        brand: {
          900: "#051F20",
          800: "#0B2B26",
          700: "#163832",
          600: "#235347",
          300: "#8EB69B",
          100: "#DAF1DE",
        },
      },

      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },

    },
  },
  plugins: [],
}
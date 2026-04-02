/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        milDark: '#0e1411',
        milGreen: '#1b2d21',
        milAccent: '#32e061',
        milWeak: '#e0c232',
        milAlert: '#e03232',
      }
    },
  },
  plugins: [],
}

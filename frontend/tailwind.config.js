/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ["./src/**/*.{js,jsx,ts,tsx}",],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0fbf9',
          100: '#e0f7f5',
          200: '#b3ece6',
          300: '#80e0d6',
          400: '#4dd4c7',
          500: '#00bfa5',
          600: '#00a38c',
          700: '#008770',
          800: '#006b58',
          900: '#004f40',
        },
      },
    },
  },
  plugins: [ 
  require('@tailwindcss/forms'),
  require('@tailwindcss/typography'),
  require('@tailwindcss/aspect-ratio'),
],
}


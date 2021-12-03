const colors = require('tailwindcss/colors')

module.exports = {
  mode: 'jit',
  purge: ['./resources/views/**/*.edge', './resources/assets/ts/**/*.ts'],
  darkMode: 'class', // or 'media' or 'class'
  variants: {
    extend: {},
  },
  plugins: [],
  theme: {
    colors: {
      'transparent': 'transparent',
      'current': 'currentColor',
      'primary': colors.amber,
      'black': colors.black,
      'white': colors.white,
      'gray': colors.trueGray,
      'indigo': colors.indigo,
      'red': colors.rose,
      'yellow': colors.amber,
      'teal': colors.teal,
      'darkblue': colors.blueGray,
      'blue': colors.blue,
      'green': colors.green,
      'dark-gray': '#5e7089',
      'dark-light': '#1f1f1f',
      'dark-dark': '#111111',
    },
    fontFamily: {
      sans: ['"Poppins"', 'sans-serif'],
    },
    extend: {
      display: ['group-hover'],
      width: {
        '50px': '50px',
      },
      height: {
        '50px': '50px',
      },
    },
  },
}

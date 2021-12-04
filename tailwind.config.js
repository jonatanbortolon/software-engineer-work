const colors = require('tailwindcss/colors')

module.exports = {
  mode: 'jit',
  purge: ['./resources/views/**/*.edge', './resources/assets/ts/**/*.ts'],
  darkMode: 'class', // or 'media' or 'class'
  variants: {
    extend: {},
  },
  plugins: [require('tailwind-scrollbar')],
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
      keyframes: {
        ring: {
          '0%': { transform: 'rotateZ(0)' },
          '1%': { transform: 'rotateZ(30deg)' },
          '3%': { transform: 'rotateZ(-28deg)' },
          '5%': { transform: 'rotateZ(34deg)' },
          '7%': { transform: 'rotateZ(-32deg)' },
          '9%': { transform: 'rotateZ(30deg)' },
          '11%': { transform: 'rotateZ(-28deg)' },
          '13%': { transform: 'rotateZ(26deg)' },
          '15%': { transform: 'rotateZ(-24deg)' },
          '17%': { transform: 'rotateZ(22deg)' },
          '19%': { transform: 'rotateZ(-20deg)' },
          '21%': { transform: 'rotateZ(18deg)' },
          '23%': { transform: 'rotateZ(-16deg)' },
          '25%': { transform: 'rotateZ(14deg)' },
          '27%': { transform: 'rotateZ(-12deg)' },
          '29%': { transform: 'rotateZ(10deg)' },
          '31%': { transform: 'rotateZ(-8deg)' },
          '33%': { transform: 'rotateZ(6deg)' },
          '35%': { transform: 'rotateZ(-4deg)' },
          '37%': { transform: 'rotateZ(2deg)' },
          '39%': { transform: 'rotateZ(-1deg)' },
          '41%': { transform: 'rotateZ(1deg)' },
          '43%': { transform: 'rotateZ(0)' },
          '100%': { transform: 'rotateZ(0)' },
        },
      },
      animation: {
        'bell-ring': 'ring 4s ease-in-out infinite',
      },
    },
  },
}

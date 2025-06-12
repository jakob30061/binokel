/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  plugins: [
    require('tailwindcss-primeui')
  ],
  content: [
    './components/**/*.{vue,js}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}'
  ],
  safelist: [
    'rotate-0',
    {
      pattern: /rotate-\d+/,
    }
  ],
  theme: {
    extend: {
      rotate: {
        '15': '15deg',
        '30': '30deg',
      }
    },
  }
}
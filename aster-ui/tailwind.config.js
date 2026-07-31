/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      colors: {
        aster: {
          indigo: '#6366F1',
          indigoDark: '#4F46E5',
          indigoLight: 'rgba(99, 102, 241, 0.15)',
          teal: '#14B8A6',
          tealLight: 'rgba(20, 184, 166, 0.15)',
          bg: '#090D16',
          card: '#131C2E',
          cardHover: '#1E293B',
          border: '#1E293B',
          slate: '#F8FAFC',
          slateMuted: '#94A3B8',
          crimson: '#F87171'
        }
      },
      fontFamily: {
        heading: ['Inter', 'sans-serif'],
        body: ['Roboto', 'sans-serif']
      }
    },
  },
  plugins: [],
}

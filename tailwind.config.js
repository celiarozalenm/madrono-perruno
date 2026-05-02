/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fef7ee',
          100: '#fdecd6',
          200: '#fad6ad',
          300: '#f6b878',
          400: '#f19142',
          500: '#ed731f',
          600: '#de5915',
          700: '#b84314',
          800: '#933618',
          900: '#762e16',
        },
        // Azul institucional Ayuntamiento de Madrid — royal blue saturado,
        // mismo tono que las tiles de categorías y el botón "Línea Madrid"
        // en madrid.es. Se usa como sello de "denominación de origen" en
        // enlaces a datos.madrid.es, chips de datasets y badges
        // institucionales — nunca como CTA principal, para no competir con el
        // naranja `brand`.
        madrid: {
          50: '#e8eeff',
          100: '#cdd8fe',
          500: '#003df6',
          600: '#0030c4',
          700: '#002491',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}


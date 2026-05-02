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
        // Rojo de los frutos del madroño — uno de los colores del logo.
        // Se usa como sello "denominación de origen" en enlaces a
        // datos.madrid.es, chips de datasets, footer y la métrica "perros"
        // en stats. Mantiene la identidad visual unida al icono.
        madrono: {
          50: '#fcecec',
          100: '#f5c8ca',
          500: '#c8252b',
          600: '#a01c21',
          700: '#751417',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}


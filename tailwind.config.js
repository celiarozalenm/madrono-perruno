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
        // Marrón tronco del madroño — color del logo, usado como sello
        // "denominación de origen" en enlaces a datos.madrid.es, chips de
        // datasets y footer. El rojo de los frutos queda reservado solo
        // como decoración dentro del icono.
        madrono: {
          50: '#f5f0eb',
          100: '#e3d5c4',
          500: '#5a3f2a',
          600: '#48321f',
          700: '#382617',
        },
        // Verde madroño — color del logo (copa del árbol). Áreas caninas,
        // estados positivos (con bolsas), tints suaves de fondos.
        verde: {
          50: '#e7f2ea',
          100: '#cce5d2',
          500: '#2a6f35',
          600: '#225a2b',
          700: '#1a4421',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}


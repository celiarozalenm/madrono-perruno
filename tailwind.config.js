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
        // Verde tierra — terciario, usado como acento en confirmaciones,
        // áreas/parques y en cards "colabora". Tonos terrosos compatibles
        // con la paleta naranja/marrón.
        verde: {
          50: '#eef2e9',
          100: '#d8e1cf',
          500: '#3d6e3a',
          600: '#2f5b2c',
          700: '#244520',
        },
        // Azul agua — teal-blue terroso, complementario del naranja
        // brand y casado con el verde y el madroño en saturación/luminosidad.
        // NO es el azul institucional del Ayuntamiento (#003df6); ese satura
        // demasiado para esta paleta cálida y editorial.
        agua: {
          50: '#eef5f9',
          100: '#d4e6ee',
          200: '#adcedc',
          300: '#7eb1c5',
          400: '#5396ad',
          500: '#2f6e8c',
          600: '#255871',
          700: '#1d4458',
          800: '#163242',
          900: '#0f222e',
        },
        // Marrón tronco del madroño — segundo color de marca. Gama tonal
        // completa para acentos cálidos.
        madrono: {
          50: '#f5f0eb',
          100: '#e3d5c4',
          200: '#cdb89e',
          300: '#b89a76',
          400: '#8c6a44',
          500: '#5a3f2a',
          600: '#48321f',
          700: '#382617',
          800: '#2a1c10',
          900: '#1c1208',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}


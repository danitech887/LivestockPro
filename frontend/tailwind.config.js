/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        farm: {
          50: '#f2f8f4',
          100: '#e1efe6',
          200: '#c5e0d0',
          300: '#9bc8b0',
          400: '#6ea98c',
          500: '#488c6e',
          600: '#347055',
          700: '#2a5944',
          800: '#244738',
          900: '#1e3b2f',
          950: '#0e2019',
        },
        dairy: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        beef: {
          50: '#fef3f2',
          100: '#fee4e2',
          500: '#f04438',
          600: '#d92d20',
          700: '#b42318',
        },
        harvest: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

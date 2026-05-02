/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          900: 'rgb(var(--c900) / <alpha-value>)',
          800: 'rgb(var(--c800) / <alpha-value>)',
          700: 'rgb(var(--c700) / <alpha-value>)',
          600: 'rgb(var(--c600) / <alpha-value>)',
          500: 'rgb(var(--c500) / <alpha-value>)',
          400: 'rgb(var(--c400) / <alpha-value>)',
        },
        accent: {
          purple: '#8b5cf6',
          'purple-light': '#a78bfa',
          blue: '#3b82f6',
          pink: '#ec4899',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

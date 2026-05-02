/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/renderer/**/*.{html,js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#121212',
          800: '#1e1e1e',
          700: '#2a2a2a',
          600: '#3a3a3a',
        },
        primary: {
          500: 'rgb(var(--primary-500) / <alpha-value>)',
          600: 'rgb(var(--primary-600) / <alpha-value>)',
        },
        dark: {
          900: 'rgb(var(--bg-900) / <alpha-value>)',
          800: 'rgb(var(--bg-800) / <alpha-value>)',
          700: 'rgb(var(--bg-700) / <alpha-value>)',
          600: 'rgb(var(--bg-600) / <alpha-value>)',
        },
        txt: {
          main: 'rgb(var(--text-main) / <alpha-value>)',
          muted: 'rgb(var(--text-muted) / <alpha-value>)',
        }
      }
    },
  },
  plugins: [],
}

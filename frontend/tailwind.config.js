/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFDFB',
          100: '#FFF8F1',
          200: '#FFF4EA',
          300: '#FCE8D7',
          400: '#FBE1CD',
          500: '#EADFD5',
        },
        primary: {
          DEFAULT: '#C94F08',
          hover: '#A83F05',
          active: '#873304',
          light: '#FFF0E3',
          focus: '#2563EB',
        },
        charcoal: '#171717',
        'body-text': '#5F5A55',
        'muted-text': '#77716C',
        'border-warm': '#EADFD5',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}
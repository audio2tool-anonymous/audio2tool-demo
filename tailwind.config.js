/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#fafafa',
          elevated: '#ffffff',
          muted: '#f4f4f5',
        },
        border: {
          DEFAULT: '#e4e4e7',
          subtle: '#f4f4f5',
        },
        accent: {
          DEFAULT: '#2563eb',
          muted: '#dbeafe',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

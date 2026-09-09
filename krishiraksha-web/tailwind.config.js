/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agri: {
          dark: '#0f172a',
          card: '#1e293b',
          border: '#334155',
          primary: '#10b981',
          'primary-dark': '#047857',
          'primary-light': '#6ee7b7',
          amber: '#f59e0b',
          red: '#ef4444',
          subtle: '#94a3b8'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}

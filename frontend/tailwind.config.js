/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        display: ['Sora', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#10b981', // Crisp Emerald Green
          600: '#059669',
          700: '#047857',
          accent: '#06b6d4', // Cyan
        },
        dark: {
          bg: '#070709',
          card: '#0e0e12',
          cardHover: '#13131a',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(255, 255, 255, 0.18)',
        }
      },
      boxShadow: {
        'glow-emerald': '0 0 40px -10px rgba(16, 185, 129, 0.3)',
        'glow-cyan': '0 0 40px -10px rgba(6, 182, 212, 0.3)',
        'card-dark': '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
      }
    },
  },
  plugins: [],
}

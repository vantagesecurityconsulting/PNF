/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        green: {
          DEFAULT: '#3fae29',
          dark: '#2d8c1e',
          light: '#e8f7e5',
        },
        ink: '#111111',
        offwhite: '#f5f5f3',
        graytext: '#6b6b6b',
        amber: { DEFAULT: '#f5a623' },
        danger: '#d0021b',
        info: '#1976D2',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontVariantNumeric: {
        tabular: 'tabular-nums',
      },
      boxShadow: {
        card: '0 1px 3px rgba(17,17,17,0.08), 0 1px 2px rgba(17,17,17,0.04)',
        'card-hover': '0 4px 16px rgba(17,17,17,0.12)',
        slideover: '-8px 0 32px rgba(17,17,17,0.12)',
      },
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'toast-in': {
          '0%': { transform: 'translateY(-16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.25s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'toast-in': 'toast-in 0.25s ease-out',
        'pulse-soft': 'pulse-soft 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

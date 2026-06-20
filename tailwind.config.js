/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Drivex brand accent (orange)
        brand: {
          DEFAULT: '#E8500A',
          light: '#FF6B2B',
        },
        // `green` is repointed to the brand's SUCCESS green so all existing
        // "good / active / complete" status usages remain correct.
        green: {
          DEFAULT: '#1D9E75',
          dark: '#25b083',
          light: 'rgba(29,158,117,0.15)',
        },
        // Dark theme neutrals
        ink: '#111111', // dark backgrounds (header, overlays)
        offwhite: '#111111', // page background (now dark)
        base: '#111111',
        surface: '#1A1A1A', // cards / panels / inputs
        line: '#2A2A2A', // borders
        muted: '#888888',
        graytext: '#888888',
        // Status palette
        amber: { DEFAULT: '#EF9F27' },
        danger: '#E24B4A',
        info: '#1976D2',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      // Brand rule: flat & clean — no drop shadows.
      boxShadow: {
        card: 'none',
        'card-hover': 'none',
        slideover: 'none',
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

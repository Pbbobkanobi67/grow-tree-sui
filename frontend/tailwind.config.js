/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          900: '#0d1f17',
          800: '#1a4731',
          700: '#1e5631',
          600: '#276749',
          500: '#2f855a',
          400: '#38a169',
          300: '#34d399',
          200: '#6ee7b7',
        },
        gold: {
          500: '#d4a017',
          400: '#eab308',
          300: '#fbbf24',
        },
        teal: {
          400: '#2dd4bf',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'sway': 'sway 4s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        sway: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(52, 211, 153, 0.4)' },
          '100%': { boxShadow: '0 0 40px rgba(52, 211, 153, 0.8)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'green-glow': '0 0 30px rgba(52, 211, 153, 0.5)',
        'gold-glow': '0 0 30px rgba(212, 160, 23, 0.5)',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./**/*.html', './src/**/*.js'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#bcdcff',
          300: '#8ec6ff',
          400: '#59a6ff',
          500: '#2f83ff',
          600: '#1664f0',
          700: '#0f4fd1',
          800: '#1140a8',
          900: '#143885'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace']
      },
      keyframes: {
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' }
        }
      },
      animation: {
        floaty: 'floaty 3s ease-in-out infinite'
      }
    }
  },
  plugins: []
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'base': '16px',
        'lg': '18px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '30px',
        '4xl': '36px',
        '5xl': '48px',
        '6xl': '60px',
      },
      lineHeight: {
        'relaxed': '1.7',
        'snug': '1.5',
      },
      letterSpacing: {
        'normal': '0',
        'tight': '-0.025em',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.15)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.2)',
        'large': '0 8px 24px rgba(0, 0, 0, 0.25)',
        'glow-blue': '0 0 20px rgba(37, 99, 235, 0.3)',
      },
    },
  },
  plugins: [],
}


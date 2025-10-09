/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'glow-jump': 'glow-jump 0.8s infinite ease-in-out',
        'slide-in-top': 'slide-in-top 0.5s ease-out',
        'pulse-icon': 'pulse-icon 1.5s infinite ease-in-out',
      },
      keyframes: {
        'glow-jump': {
          '0%': {
            boxShadow: '0 0 30px rgba(255, 215, 0, 0.8), 0 10px 20px rgba(0,0,0,.25)',
            transform: 'translate(-50%,-50%) scale(1)',
            borderColor: 'rgba(255, 215, 0, 0.6)',
          },
          '25%': {
            boxShadow: '0 0 50px rgba(255, 215, 0, 0.9), 0 20px 35px rgba(0,0,0,.4)',
            transform: 'translate(-50%,-65%) scale(1.05)',
            borderColor: 'rgba(255, 215, 0, 0.8)',
          },
          '50%': {
            boxShadow: '0 0 60px rgba(255, 215, 0, 1), 0 25px 40px rgba(0,0,0,.5)',
            transform: 'translate(-50%,-70%) scale(1.08)',
            borderColor: 'rgba(255, 215, 0, 1)',
          },
          '75%': {
            boxShadow: '0 0 50px rgba(255, 215, 0, 0.9), 0 20px 35px rgba(0,0,0,.4)',
            transform: 'translate(-50%,-55%) scale(1.03)',
            borderColor: 'rgba(255, 215, 0, 0.8)',
          },
          '100%': {
            boxShadow: '0 0 30px rgba(255, 215, 0, 0.8), 0 10px 20px rgba(0,0,0,.25)',
            transform: 'translate(-50%,-50%) scale(1)',
            borderColor: 'rgba(255, 215, 0, 0.6)',
          },
        },
        'slide-in-top': {
          '0%': {
            opacity: '0',
            transform: 'translateX(-50%) translateY(-30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(-50%) translateY(0)',
          },
        },
        'pulse-icon': {
          '0%, 100%': {
            transform: 'scale(1)',
          },
          '50%': {
            transform: 'scale(1.2)',
          },
        },
      },
    },
  },
  plugins: [],
}
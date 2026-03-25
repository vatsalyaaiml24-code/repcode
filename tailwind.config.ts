import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0a0f1e',
          900: '#10162a',
          800: '#1a223a',
        },
        electric: {
          blue: '#2563eb',
          purple: '#7c3aed',
        },
      },
      boxShadow: {
        'glass': '0 4px 32px 0 rgba(59,130,246,0.15), 0 1.5px 8px 0 rgba(124,58,237,0.10)',
        'inner-glow': 'inset 0 1.5px 8px 0 rgba(59,130,246,0.10)',
        'neon-blue': '0 0 8px 2px #2563eb, 0 0 24px 4px #2563eb44',
        'neon-green': '0 0 8px 2px #22d3ee, 0 0 24px 4px #22d3ee44',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '16px',
      },
      fontFamily: {
        mono: ['Fira Mono', 'Menlo', 'Monaco', 'monospace'],
      },
      backgroundImage: {
        'mesh-gradient': 'radial-gradient(ellipse at 20% 20%, #2563eb33 0%, transparent 70%), radial-gradient(ellipse at 80% 80%, #7c3aed33 0%, transparent 70%)',
      },
      transitionTimingFunction: {
        'ease': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'fade-slide-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer': {
          '100%': { backgroundPosition: '200% center' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 16px 4px #2563eb88' },
          '50%': { boxShadow: '0 0 32px 8px #7c3aed88' },
        },
        'float-particles': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-20px)' },
        },
      },
      animation: {
        'fade-slide-up': 'fade-slide-up 0.7s cubic-bezier(0.4,0,0.2,1)',
        'shimmer': 'shimmer 1.2s linear infinite',
        'pulse-glow': 'pulse-glow 2s infinite',
        'float-particles': 'float-particles 6s ease-in-out infinite alternate',
      },
    }
  },
  plugins: []
};

export default config;

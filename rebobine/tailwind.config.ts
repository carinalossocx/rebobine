import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#D946EF',
          hover: '#C026D3',
          active: '#A21CAF',
          light: '#F0ABFC',
        },
        secondary: {
          DEFAULT: '#22D3EE',
        },
        tertiary: {
          DEFAULT: '#FACC15',
        },
        surface: {
          DEFAULT: '#18181B', // zinc-900 — cards/modais no modo escuro
          raised: '#27272A', // zinc-800 — hover/elevado
        },
        bg: {
          DEFAULT: '#0A0A0B', // fundo global escuro
        },
      },
      fontFamily: {
        display: ['var(--font-poppins)', 'sans-serif'],
        body: ['var(--font-nunito)', 'sans-serif'],
        mono: ['var(--font-space-mono)', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
        medium: '0 4px 6px rgba(0,0,0,0.35), 0 2px 4px rgba(0,0,0,0.25)',
        large: '0 10px 25px rgba(0,0,0,0.4), 0 6px 10px rgba(0,0,0,0.3)',
        overlay: '0 25px 50px rgba(0,0,0,0.5), 0 12px 24px rgba(0,0,0,0.35)',
        'product-hover': '0 14px 32px rgba(217,70,239,0.18), 0 6px 12px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
};
export default config;

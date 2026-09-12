import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ShopVibe Primary Palette (Light & Dark)
        primary: {
          DEFAULT: '#D946EF',
          hover: '#C026D3',
          active: '#A21CAF',
          light: '#F0ABFC',
          dark: '#EC4899',
        },
        secondary: {
          DEFAULT: '#22D3EE', // Cyan - sale badges, promo banners
          hover: '#06B6D4',
          dark: '#06B6D4',
        },
        tertiary: {
          DEFAULT: '#FACC15', // Yellow - ratings, highlights
          hover: '#EAB308',
          dark: '#FCD34D',
        },
        // Light Mode Backgrounds
        bg: {
          DEFAULT: '#FAFAFA', // Global page background - clean and airy
          dark: '#0F172A', // Dark mode background
        },
        surface: {
          DEFAULT: '#FFFFFF', // Cards, modals, cart drawer
          light: '#F5F5F5', // Hover states
          muted: '#F9FAFB', // Subtle backgrounds
          dark: '#1E293B', // Dark mode cards
          'dark-light': '#334155', // Dark mode hover
          'dark-muted': '#0F172A', // Dark mode subtle bg
        },
        // Semantic Colors
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        // Text - Light Mode
        text: {
          primary: '#171717',
          secondary: '#525252',
          tertiary: '#A3A3A3',
          inverse: '#FFFFFF',
        },
        // Text - Dark Mode
        'text-dark': {
          primary: '#F8FAFC',
          secondary: '#CBD5E1',
          tertiary: '#94A3B8',
          inverse: '#0F172A',
        },
        // Borders
        border: {
          DEFAULT: '#E5E5E5',
          light: '#F5F5F5',
          muted: '#D4D4D4',
          dark: '#334155',
          'dark-light': '#475569',
        },
      },
      fontFamily: {
        display: ['var(--font-poppins)', 'sans-serif'],
        body: ['var(--font-nunito)', 'sans-serif'],
        mono: ['var(--font-space-mono)', 'monospace'],
      },
      fontSize: {
        // Display: Poppins 56px extra-bold, 1.1 line height
        'display-lg': ['56px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        // Headline: Poppins 40px bold, 1.2 line height
        'headline': ['40px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        // Subhead: Poppins 26px semibold
        'subhead': ['26px', { lineHeight: '1.3', letterSpacing: '-0.005em', fontWeight: '600' }],
        // Body Large: Nunito 18px regular
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        // Body: Nunito 16px regular
        'body-md': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        // Body Small: Nunito 14px regular
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        // Caption: Nunito 12px medium
        'caption': ['12px', { lineHeight: '1.4', letterSpacing: '0.02em', fontWeight: '500' }],
        // Overline: Nunito 11px bold
        'overline': ['11px', { lineHeight: '1.2', letterSpacing: '0.1em', fontWeight: '700' }],
      },
      borderRadius: {
        none: '0px',
        xs: '4px',
        sm: '12px',
        md: '16px',
        lg: '24px',
        full: '9999px',
      },
      spacing: {
        // Base unit: 8px
        // Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
        '3xl': '48px',
        '4xl': '64px',
        '5xl': '96px',
        '6xl': '128px',
      },
      boxShadow: {
        // Material-style layered shadows
        'subtle': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'medium': '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.05)',
        'large': '0 10px 25px rgba(0,0,0,0.1), 0 6px 10px rgba(0,0,0,0.06)',
        'overlay': '0 25px 50px rgba(0,0,0,0.15), 0 12px 24px rgba(0,0,0,0.08)',
        'product-hover': '0 14px 32px rgba(217,70,239,0.12), 0 6px 12px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      black: '#000000',
      white: '#FFFFFF',
      'neon-green': '#00FF00',
      transparent: 'transparent',
      current: 'currentColor',
    },
    fontFamily: {
      sans: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
    },
    fontSize: {
      'xs': ['11px', { lineHeight: '1.6' }],
      'sm': ['13px', { lineHeight: '1.6' }],
      'base': ['13px', { lineHeight: '1.6' }],
      'lg': ['15px', { lineHeight: '1.4' }],
      'xl': ['18px', { lineHeight: '1.3' }],
      '2xl': ['24px', { lineHeight: '1.2' }],
      '3xl': ['32px', { lineHeight: '1.1' }],
      'body': ['13px', { lineHeight: '1.6' }],
      'small': ['11px', { lineHeight: '1.6' }],
      'product-name': ['14px', { lineHeight: '1.4' }],
      'section-header': ['18px', { lineHeight: '1.3' }],
      'page-title': ['32px', { lineHeight: '1.1' }],
    },
    spacing: {
      '0': '0',
      'px': '1px',
      'xs': '8px',
      'sm': '16px',
      'md': '24px',
      'lg': '32px',
      'xl': '48px',
      '2xl': '64px',
      '3xl': '96px',
      '1': '8px',
      '2': '16px',
      '3': '24px',
      '3.5': '14px',
      '4': '32px',
      '5': '40px',
      '6': '48px',
      '8': '64px',
      '10': '80px',
      '12': '96px',
      '16': '128px',
      '20': '160px',
      '24': '192px',
      'header': '44px',
      'container': '1600px',
    },
    letterSpacing: {
      'tighter': '-0.01em',
      'normal': '0',
      'wider': '0.03em',
    },
    fontWeight: {
      'thin': '100',
      'light': '300',
      'normal': '400',
      'medium': '500',
      'semibold': '600',
      'bold': '700',
    },
    extend: {
      maxWidth: {
        'container': '1600px',
      },
      aspectRatio: {
        'product': '3/4',
      },
    },
  },
  plugins: [],
};

export default config;

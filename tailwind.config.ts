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
      'xs': ['12px', { lineHeight: '1.5' }],
      'sm': ['14px', { lineHeight: '1.5' }],
      'base': ['16px', { lineHeight: '1.5' }],
      'lg': ['18px', { lineHeight: '1.3' }],
      'xl': ['24px', { lineHeight: '1.2' }],
      '2xl': ['32px', { lineHeight: '1.2' }],
      '3xl': ['48px', { lineHeight: '1.1' }],
      'body': ['16px', { lineHeight: '1.5' }],
      'small': ['14px', { lineHeight: '1.5' }],
      'product-name': ['18px', { lineHeight: '1.3' }],
      'section-header': ['24px', { lineHeight: '1.2' }],
      'page-title': ['48px', { lineHeight: '1.1' }],
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
      '4': '32px',
      '5': '40px',
      '6': '48px',
      '8': '64px',
      '10': '80px',
      '12': '96px',
      '16': '128px',
      '20': '160px',
      '24': '192px',
      'header': '80px',
      'container': '1600px',
    },
    letterSpacing: {
      'tighter': '-0.02em',
      'normal': '0',
      'wider': '0.05em',
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

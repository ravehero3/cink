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
      sans: ['BB-Regular', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
    },
    fontSize: {
      'xs': ['10px', { lineHeight: '1.6' }],
      'sm': ['12px', { lineHeight: '1.6' }],
      'base': ['14px', { lineHeight: '21px' }],
      'lg': ['14px', { lineHeight: '1.4' }],
      'xl': ['17px', { lineHeight: '1.3' }],
      '2xl': ['23px', { lineHeight: '1.2' }],
      '3xl': ['31px', { lineHeight: '1.1' }],
      'body': ['14px', { lineHeight: '21px' }],
      'small': ['10px', { lineHeight: '1.6' }],
      'product-name': ['13px', { lineHeight: '1.4' }],
      'section-header': ['17px', { lineHeight: '1.3' }],
      'page-title': ['31px', { lineHeight: '1.1' }],
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
      'videopromo': '500px',
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
      inset: {
        'header': '44px',
      },
      height: {
        'header': '44px',
      },
    },
  },
  plugins: [],
};

export default config;

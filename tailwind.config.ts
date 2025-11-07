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
      transparent: 'transparent',
      current: 'currentColor',
    },
    fontFamily: {
      sans: ['Arial', 'Helvetica', 'sans-serif'],
    },
    fontSize: {
      'body': ['14px', { lineHeight: '1.4' }],
      'product-name': ['16px', { lineHeight: '1.4' }],
      'header': ['18px', { lineHeight: '1.4' }],
      'title': ['24px', { lineHeight: '1.4' }],
    },
    extend: {
      spacing: {
        'header': '60px',
        'titlebar': '240px',
        'videopromo': '360px',
      },
    },
  },
  plugins: [],
};

export default config;

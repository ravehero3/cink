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
      'body': ['11px', { lineHeight: '1.4' }],
      'product-name': ['12px', { lineHeight: '1.4' }],
      'header': ['13px', { lineHeight: '1.4' }],
      'title': ['18px', { lineHeight: '1.4' }],
    },
    extend: {
      spacing: {
        'header': '48px',
        'titlebar': '192px',
        'videopromo': '288px',
      },
    },
  },
  plugins: [],
};

export default config;

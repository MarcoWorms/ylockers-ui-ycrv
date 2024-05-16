import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    'bg-light-blue/60', 'border-light-blue',
    'bg-charge-red/60', 'border-charge-red',
    'bg-dark-black/60', 'border-transparent'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-aeonik-sans)'],
        thin: ['var(--font-aeonik-sans)'],
        mono: ['var(--font-aeonik-mono)'],
      },
      colors: {
        'dark-black': '#070000',
        'dark-blue': '#3d0000',
        'bg-one': '#8a0000',
        'bg-two': '#070000',
        'white': '#FFFFFF',
        'offwhite': '#F4F4F4',
        'blue': '#700000',
        'darker-blue': '#490000',
        'darker-blue-bg': 'rgba(131, 16, 16, 0.37)',
        'soft-blue': '#8d5555',
        'input-bg': '#531111',
        'boost-blue': '#ff0000',
        'light-blue': '#ff0000',
        'lighter-blue': '#ff4d4d',
        'disabled-bg': '#DFDFDF',
        'disabled-text': '#9D9D9D',
        'charge-red': '#FF0F00',
        'charge-yellow': '#DBFF00',
        'tab-inactive': 'rgba(255,255,255,0.2)',
        'tab-inactive-inner': 'rgba(255,255,255,0.3)'
      },
      boxShadow: {
        'lg': '0 -40px 80px 80px rgba(0,0,0,0.9)',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        'gradient-text': 'linear-gradient(230deg, rgba(200,25,40,1) 0%, rgba(219,110,55,1) 20%, rgba(236,184,64,1) 40%, rgba(104,183,120,1) 60%, rgba(71,119,211,1) 80%, rgba(72,44,216,1) 100%)',
      },
    },
  },
  plugins: [],
};
export default config;

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
        'dark-black': '#000107',
        'dark-blue': '#0039A8',
        'white': '#FFFFFF',
        'offwhite': '#F4F4F4',
        'blue': '#001170',
        'darker-blue': '#000B49',
        'darker-blue-bg': '#1021835e',
        'soft-blue': '#555D8D',
        'input-bg': '#111B53',
        'boost-blue': '#0027ff',
        'light-blue': '#00A3FF',
        'lighter-blue': '#4DBFFF',
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

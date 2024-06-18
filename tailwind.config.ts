import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'gray-900': '#121212',
      },
      backdropFilter: {
        'none': 'none',
        'blur-lg': 'blur(10px)',
      },
      boxShadow: {
        'music-hover': '0 0 10px 2px rgba(255, 255, 255, 0.5)',
      },
    },
  },
  plugins: [],
};
export default config;

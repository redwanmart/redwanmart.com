import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Redwan Mart Brand Colors
        'rm-red': '#DC2626',
        'rm-red-light': '#EF4444',
        'rm-red-dark': '#991B1B',
        'rm-gold': '#FBBF24',
        'rm-gold-light': '#FCD34D',
        'rm-gray': '#1F2937',
        'rm-gray-light': '#F3F4F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      spacing: {
        'sm': '0.5rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2rem',
        '2xl': '3rem',
      },
    },
  },
  plugins: [],
} satisfies Config;

import type { Config } from 'tailwindcss';

/**
 * Colours are sampled directly from the official Redwan Mart logo artwork:
 * squircle red #CC2028, the "M" gold #F0B850.
 */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FEF2F2',
          100: '#FDE3E4',
          200: '#FAC5C8',
          300: '#F49AA0',
          400: '#EA6069',
          500: '#DC3742',
          600: '#CC2028', // official logo red
          700: '#A81920',
          800: '#8A181D',
          900: '#73181C',
        },
        gold: {
          100: '#FDF3DF',
          200: '#FAE4B6',
          300: '#F6D086',
          400: '#F0B850', // official logo gold
          500: '#E5A233',
          600: '#C88425',
        },
        ink: {
          DEFAULT: '#14161A',
          soft: '#3A3F47',
          muted: '#6B7280',
          faint: '#9CA3AF',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          soft: '#FAFAFB',
          sunken: '#F4F5F7',
          line: '#E7E8EC',
        },

        // Legacy aliases — keep admin pages working.
        'rm-red': '#CC2028',
        'rm-red-light': '#DC3742',
        'rm-red-dark': '#A81920',
        'rm-gold': '#F0B850',
        'rm-gold-light': '#F6D086',
        'rm-gray': '#14161A',
        'rm-gray-light': '#F4F5F7',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Baloo 2', 'Poppins', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['clamp(2.5rem, 6vw, 4.5rem)', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
        'title': ['clamp(1.9rem, 3.6vw, 2.9rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
      },
      boxShadow: {
        card: '0 1px 2px rgba(20,22,26,.04), 0 8px 24px -12px rgba(20,22,26,.14)',
        lift: '0 2px 4px rgba(20,22,26,.05), 0 24px 48px -20px rgba(20,22,26,.26)',
        ring: '0 0 0 1px rgba(20,22,26,.06)',
      },
      borderRadius: {
        xl2: '1.25rem',
        squircle: '28%',
      },
      maxWidth: {
        content: '78rem',
      },
      keyframes: {
        rise: { '0%': { opacity: '0', transform: 'translateY(14px)' }, '100%': { opacity: '1', transform: 'none' } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
      },
      animation: {
        rise: 'rise .6s cubic-bezier(.22,.8,.3,1) both',
        marquee: 'marquee 26s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;

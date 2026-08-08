import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://redwanmart.com',
  integrations: [react()], // Tailwind runs through postcss.config.cjs
  output: 'static',
  adapter: cloudflare(),
  vite: {
    ssr: {
      external: ['wasm-bindgen'],
    },
  },
});

import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://redwanmart.com',
  integrations: [react(), tailwind()],
  output: 'static',
  adapter: cloudflare(),
  vite: {
    ssr: {
      external: ['wasm-bindgen'],
    },
  },
});

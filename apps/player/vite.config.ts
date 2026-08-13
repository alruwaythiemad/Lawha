import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  build: {
    // Chromium 76 / ES2019 floor (Tizen 6.0 televisions) — see
    // ARCHITECTURE-SPINE.md § Stack and DESIGN.md's Chromium 76 prohibitions.
    target: 'es2019',
  },
});

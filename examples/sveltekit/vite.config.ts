import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { artboard } from 'sveltekit-artboard';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    artboard({
      route: '/__artboard',
      entry: './artboard/Artboard.svelte',
      css: './artboard/artboard.css',
      studioTheme: 'dark',
    }),
    tailwindcss(),
    sveltekit({
      compilerOptions: {
        runes: ({ filename }) => {
          return filename.split(/[/\\]/).includes('node_modules') ? undefined : true;
        },
      },
      adapter: adapter(),
    }),
  ],
  server: {
    allowedHosts: true,
  },
  preview: {
    allowedHosts: true,
  },
});

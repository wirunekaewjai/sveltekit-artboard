import { compile } from 'svelte/compiler';

type RolldownPlugin = {
  name: string;
  transform: (code: string, id: string) => { code: string; map?: string | null } | undefined;
};

/**
 * Minimal Rolldown/tsdown plugin that compiles Svelte 5 `.svelte` components (including
 * native TypeScript in `<script lang="ts">` and templates) with `css: 'injected'` so the
 * Studio UI bundles cleanly into a single self-contained `dist/studio.js`.
 */
export const sveltePackPlugin = (): RolldownPlugin => {
  return {
    name: 'rolldown-svelte-pack',
    transform(code: string, id: string): { code: string; map?: string | null } | undefined {
      const cleanId = id.split('?')[0];
      if (!cleanId.endsWith('.svelte')) {
        return undefined;
      }

      const compiled = compile(code, {
        filename: cleanId,
        generate: 'client',
        css: 'injected',
        dev: false,
      });

      return {
        code: compiled.js.code,
        map: compiled.js.map ? JSON.stringify(compiled.js.map) : null,
      };
    },
  };
};

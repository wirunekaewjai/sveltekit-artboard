<script lang="ts">
  import './layout.css';

  import favicon from '#lib/assets/favicon.svg';
  import { workspace } from '#lib/state/workspace.svelte.ts';

  import type { LayoutProps } from './$types';

  let { children }: LayoutProps = $props();

  const isDev = import.meta.env.DEV;
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>Veloce Studio — Atomic Design Demo</title>
</svelte:head>

<div class="{workspace.darkMode ? 'dark' : ''} min-h-screen w-full bg-white dark:bg-zinc-950">
  {@render children()}

  {#if isDev}
    <a
      href="/__artboard"
      data-sveltekit-reload
      class="fixed right-4 bottom-4 z-40 inline-flex items-center gap-2 rounded-full border border-indigo-400/40 bg-zinc-900/95 px-3.5 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-md transition-transform hover:scale-105 hover:bg-indigo-600"
    >
      <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
      Open Artboard Studio (Dev)
    </a>
  {/if}
</div>

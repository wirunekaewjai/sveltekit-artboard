# sveltekit-artboard

A dev-only Figma-like **Artboard UI Review Studio** Vite plugin for **Svelte 5** and **SvelteKit**.

Author your entire artboard catalog in a single `artboard/Artboard.svelte` file using Svelte 5 `{#snippet}`s and reusable `ArtboardViewport` objects. View Atomic Design components, dialogs, and full page templates side-by-side on an infinite pan/zoom canvas at `/__artboard` during `vite dev` — with **0 bytes** of plugin code, CSS, or routes shipped in `vite build`.

## Features

- **Single-File Svelte 5 Authoring**: Write `{#snippet}`s and `defineArtboards(...)` in one `Artboard.svelte` file — full TypeScript prop safety with zero wrapper boilerplate.
- **100% Dev-Only**: Active strictly under `vite serve` (`apply: (_config, env) => env.command === 'serve' && !process.env.VITEST`). Completely absent from `vite build` and `vite preview`.
- **Zero CSS Collision + Light/Dark Studio UI**: Studio chrome (`dist/studio.js`) uses component-scoped CSS with Light, Dark, and System themes (`studioTheme`), completely independent of your app's own CSS or themes.
- **Optional Custom App Themes**: Pass any number of custom `themes` (`class` and/or `attrs` like `data-theme`) to `<Artboard>` — or omit `themes` entirely if your app has no theming.
- **IntersectionObserver Virtualization**: Off-screen artboards automatically unmount into fixed-size placeholders, with a toggleable Debug & Performance HUD (`D`).

## Install

Install directly from GitHub, pinned to a commit SHA (pre-built `dist/` is committed so no build step is needed on install):

```sh
pnpm add -D github:<owner>/sveltekit-artboard#<commit-sha>
# npm install -D github:<owner>/sveltekit-artboard#<commit-sha>
# bun add -d github:<owner>/sveltekit-artboard#<commit-sha>
```

Peer dependencies: `vite` (`^8.0.0`) and `svelte` (`^5.0.0`).

## Quick Start

### 1. Add the plugin to `vite.config.ts`

```ts
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
      studioTheme: 'dark', // 'dark' | 'light' | 'system'
    }),
    tailwindcss(),
    sveltekit({ adapter: adapter() }),
  ],
});
```

### 2. Create `artboard/Artboard.svelte`

```svelte
<script lang="ts">
  import type {
    ArtboardRenderContext,
    ArtboardTheme,
    ArtboardViewport,
  } from 'sveltekit-artboard/studio';
  import { Artboard, defineArtboards } from 'sveltekit-artboard/studio';

  import Button from '#lib/components/atoms/Button.svelte';
  import LandingTemplate from '#lib/components/templates/LandingTemplate.svelte';
  import { FIXTURE_PRICING } from './fixtures.ts';

  const MOBILE: Readonly<ArtboardViewport> = { label: 'Mobile', width: 375, height: 820 };
  const DESKTOP: Readonly<ArtboardViewport> = { label: 'Desktop', width: 1280, height: 860 };

  // Optional — omit `themes` prop if your app does not have themes
  const APP_THEMES: ArtboardTheme[] = [
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark', class: 'dark' },
  ];

  const sections = defineArtboards([
    {
      id: 'sec-atoms',
      title: '01 / Atoms',
      category: 'atoms',
      boards: [
        {
          id: 'atom-buttons',
          title: 'Buttons',
          viewport: { width: 440, height: 240 },
          render: buttonsBoard,
        },
      ],
    },
    {
      id: 'sec-landing',
      title: '02 / Landing Page',
      category: 'templates',
      boards: [
        { id: 'landing-mobile', title: 'Landing — Mobile', viewport: MOBILE, render: landingBoard },
        {
          id: 'landing-desktop',
          title: 'Landing — Desktop',
          viewport: DESKTOP,
          render: landingBoard,
        },
      ],
    },
  ]);
</script>

{#snippet buttonsBoard()}
  <div class="flex gap-2 p-6">
    <Button variant="primary">Primary</Button>
    <Button variant="secondary">Secondary</Button>
  </div>
{/snippet}

{#snippet landingBoard(ctx: ArtboardRenderContext)}
  <LandingTemplate pricingTiers={FIXTURE_PRICING} darkMode={ctx.theme?.id === 'dark'} />
{/snippet}

<Artboard {sections} themes={APP_THEMES} />
```

### 3. (Tailwind CSS v4) Keep `artboard/` Out of Production CSS

1. Add `@source not '../../artboard';` to your app's `src/routes/layout.css` so Tailwind v4 never scans `artboard/` during `vite build`.
2. Create `artboard/artboard.css` so any Tailwind utilities used inside `artboard/Artboard.svelte` snippets still work in dev:

```css
@import '../src/routes/layout.css';
@source '.';
```

3. Add `"artboard"` to `include` in `tsconfig.json` (`"include": ["src", "artboard"]`) so `svelte-check` type-checks your artboard file.

## Options

```ts
import { artboard, DEFAULT_PROTECTED_FILES } from 'sveltekit-artboard';

artboard({
  route: '/__artboard', // Dev route URL
  entry: './artboard/Artboard.svelte', // Path to your Svelte 5 Artboard entry
  dir: '.artboard', // Comment files live in `.artboard/comments/<uuid-v7>.json` (add `.artboard/` to `.gitignore`)
  allowedHosts: ['my-pc.tailnet.ts.net'], // Extra Host headers (inherits Vite `server.allowedHosts`)
  css: './artboard/artboard.css', // Optional stylesheet(s) loaded on the artboard page
  title: 'Artboard Studio — Dev UI Review', // Browser tab title
  studioTheme: 'dark', // Studio UI theme: 'dark' | 'light' | 'system'
  storageKey: 'sveltekit-artboard-prefs-v1', // localStorage key for UI preferences
  appUrl: '/', // "Back to Live App" link in sidebar
  debug: false, // Show Stress Test, mounted counter & FPS HUD by default (toggle with `D`)
  agent: {
    allowedCommands: ['pnpm run check', 'pnpm run lint'],
    protectedFiles: [...DEFAULT_PROTECTED_FILES],
  },
});
```

See [AGENT_GUIDE.md](./AGENT_GUIDE.md) for the `.artboard/comments/<id>.json` schema and AI agent editing rules.

## Development (this repository)

```sh
pnpm install
pnpm build        # packs dist/ via vp pack
pnpm lint         # runs vp fmt --check . && vp lint .
pnpm test:e2e     # builds dist/ and runs Playwright E2E suite
pnpm dev:example  # runs examples/sveltekit with the local plugin
```

## License

MIT — see [LICENSE](./LICENSE).

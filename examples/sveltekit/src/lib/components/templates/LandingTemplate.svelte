<script lang="ts">
  import { ArrowRight, Layers, Moon, ShieldCheck, Sparkles, Sun, Zap } from '@lucide/svelte';

  import type { NavRouteId, PricingTier } from '#lib/types/domain.ts';

  import Badge from '#lib/components/atoms/Badge.svelte';
  import Button from '#lib/components/atoms/Button.svelte';
  import PricingCard from '#lib/components/molecules/PricingCard.svelte';

  type Props = {
    pricingTiers: PricingTier[];
    darkMode?: boolean;
    onnavigate?: (route: NavRouteId) => void;
    ontoggletheme?: () => void;
    onselecttier?: (tier: PricingTier) => void;
  };

  let { pricingTiers, darkMode = false, onnavigate, ontoggletheme, onselecttier }: Props = $props();

  const features = [
    {
      icon: Layers,
      title: 'Atomic View Isolation',
      description:
        'Decouple pure presentation from state and API calls so every component renders deterministically.',
    },
    {
      icon: Zap,
      title: 'Multi-Breakpoint Artboards',
      description:
        'Inspect Mobile, Tablet, and Desktop layouts side-by-side with CSS Container Queries.',
    },
    {
      icon: ShieldCheck,
      title: 'Zero Production Footprint',
      description:
        'Dev-only Vite middleware ensures review tooling is 100% stripped from production bundles.',
    },
  ];
</script>

<div
  class="@container min-h-full w-full bg-white text-slate-900 dark:bg-zinc-950 dark:text-zinc-100"
>
  <!-- Top Navigation -->
  <header
    class="sticky top-0 z-20 border-b border-slate-200/70 bg-white/85 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/85"
  >
    <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 @2xl:px-8">
      <div class="flex items-center gap-2.5">
        <div
          class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white shadow-sm"
        >
          VS
        </div>
        <span class="text-sm font-bold tracking-tight">Veloce Studio</span>
      </div>

      <nav
        class="hidden items-center gap-6 text-xs font-medium text-slate-600 @2xl:flex dark:text-zinc-400"
      >
        <button
          type="button"
          onclick={() => onnavigate?.('/dashboard')}
          class="cursor-pointer hover:text-slate-900 dark:hover:text-zinc-100"
        >
          Dashboard
        </button>
        <button
          type="button"
          onclick={() => onnavigate?.('/projects')}
          class="cursor-pointer hover:text-slate-900 dark:hover:text-zinc-100"
        >
          Projects
        </button>
        <button
          type="button"
          onclick={() => onnavigate?.('/settings')}
          class="cursor-pointer hover:text-slate-900 dark:hover:text-zinc-100"
        >
          Settings
        </button>
      </nav>

      <div class="flex items-center gap-2">
        {#if ontoggletheme}
          <button
            type="button"
            onclick={ontoggletheme}
            aria-label="Toggle theme"
            class="cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            {#if darkMode}
              <Moon class="h-4 w-4" />
            {:else}
              <Sun class="h-4 w-4" />
            {/if}
          </button>
        {/if}
        <Button size="sm" onclick={() => onnavigate?.('/dashboard')}>
          Open App
          <ArrowRight class="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="relative overflow-hidden px-4 py-14 @2xl:px-8 @2xl:py-20">
    <div
      class="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-72 max-w-2xl rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/20"
    ></div>

    <div class="relative mx-auto max-w-4xl text-center">
      <Badge tone="indigo">
        <Sparkles class="h-3 w-3" />
        SvelteKit 3 + Container Query Design System
      </Badge>

      <h1
        class="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 @2xl:text-5xl @5xl:text-6xl dark:text-zinc-50"
      >
        Review every screen size on one
        <span class="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
          infinite canvas
        </span>
      </h1>

      <p
        class="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 @2xl:text-base dark:text-zinc-400"
      >
        Veloce Studio pairs Atomic Design pure view components with a dev-only Artboard canvas so
        designers and engineers can inspect atoms, dialogs, and full pages without shipping a single
        byte of review tooling to production.
      </p>

      <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" onclick={() => onnavigate?.('/dashboard')}>
          Launch Dashboard
          <ArrowRight class="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="lg" onclick={() => onnavigate?.('/projects')}>
          Browse Projects
        </Button>
      </div>
    </div>
  </section>

  <!-- Feature Bento Grid -->
  <section
    class="border-y border-slate-200/70 bg-slate-50/70 px-4 py-12 @2xl:px-8 @2xl:py-16 dark:border-zinc-800/80 dark:bg-zinc-900/40"
  >
    <div class="mx-auto max-w-6xl">
      <div class="grid grid-cols-1 gap-4 @2xl:grid-cols-3 @2xl:gap-6">
        {#each features as feature (feature.title)}
          {@const Icon = feature.icon}
          <div
            class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400"
            >
              <Icon class="h-5 w-5" />
            </div>
            <h3 class="mt-4 text-base font-semibold text-slate-900 dark:text-zinc-50">
              {feature.title}
            </h3>
            <p class="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-zinc-400">
              {feature.description}
            </p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Pricing Section -->
  <section class="px-4 py-14 @2xl:px-8 @2xl:py-20">
    <div class="mx-auto max-w-6xl">
      <div class="text-center">
        <h2
          class="text-2xl font-bold tracking-tight text-slate-900 @2xl:text-3xl dark:text-zinc-50"
        >
          Simple, transparent pricing
        </h2>
        <p class="mt-2 text-xs text-slate-500 @2xl:text-sm dark:text-zinc-400">
          Start free with unlimited local artboards. Upgrade when your design team scales.
        </p>
      </div>

      <div class="mt-10 grid grid-cols-1 gap-5 @2xl:grid-cols-3">
        {#each pricingTiers as tier (tier.id)}
          <PricingCard {tier} onselect={onselecttier} />
        {/each}
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer
    class="border-t border-slate-200/80 px-4 py-6 text-center text-xs text-slate-500 dark:border-zinc-800 dark:text-zinc-500"
  >
    Veloce Studio — Built with SvelteKit 3, Svelte 5 Runes &amp; Tailwind CSS v4 Container Queries
  </footer>
</div>

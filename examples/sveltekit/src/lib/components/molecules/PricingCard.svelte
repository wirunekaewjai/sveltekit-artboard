<script lang="ts">
  import { Check } from '@lucide/svelte';

  import type { PricingTier } from '#lib/types/domain.ts';

  import Badge from '#lib/components/atoms/Badge.svelte';
  import Button from '#lib/components/atoms/Button.svelte';

  type Props = {
    tier: PricingTier;
    onselect?: (tier: PricingTier) => void;
  };

  let { tier, onselect }: Props = $props();
</script>

<div
  class="flex flex-col justify-between rounded-2xl border p-6 transition-shadow {tier.highlighted
    ? 'border-indigo-500 bg-indigo-50/40 shadow-lg shadow-indigo-500/10 dark:border-indigo-400 dark:bg-indigo-950/30'
    : 'border-slate-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900'}"
>
  <div>
    <div class="flex items-center justify-between gap-2">
      <h3 class="text-base font-semibold text-slate-900 dark:text-zinc-50">{tier.name}</h3>
      {#if tier.highlighted}
        <Badge tone="indigo">Most Popular</Badge>
      {/if}
    </div>
    <p class="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-zinc-400">
      {tier.description}
    </p>

    <div class="mt-5 flex items-baseline gap-1">
      <span class="text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
        {tier.price}
      </span>
      <span class="text-xs text-slate-500 dark:text-zinc-400">{tier.period}</span>
    </div>

    <ul class="mt-5 space-y-2.5 border-t border-slate-200/70 pt-5 dark:border-zinc-800">
      {#each tier.features as feature (feature)}
        <li class="flex items-start gap-2 text-xs text-slate-700 dark:text-zinc-300">
          <Check class="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
          <span>{feature}</span>
        </li>
      {/each}
    </ul>
  </div>

  <div class="mt-6">
    <Button
      variant={tier.highlighted ? 'primary' : 'secondary'}
      fullWidth
      onclick={() => onselect?.(tier)}
    >
      {tier.ctaLabel}
    </Button>
  </div>
</div>

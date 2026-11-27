<script lang="ts">
  import { TrendingDown, TrendingUp } from '@lucide/svelte';

  import type { MetricItem } from '#lib/types/domain.ts';

  type Props = {
    metric: MetricItem;
  };

  let { metric }: Props = $props();

  const sparkPoints = $derived.by(() => {
    const vals = metric.sparkline;
    if (vals.length < 2) {
      return '';
    }
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;
    return vals
      .map((v, i) => {
        const x = (i / (vals.length - 1)) * 68;
        const y = 24 - ((v - min) / range) * 20;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  });
</script>

<div
  class="@container rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs transition-shadow hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
>
  <div class="flex items-start justify-between gap-2">
    <p class="truncate text-xs font-medium text-slate-500 dark:text-zinc-400">{metric.label}</p>
    <span
      class="inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold {metric.trend ===
      'up'
        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
        : 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'}"
    >
      {#if metric.trend === 'up'}
        <TrendingUp class="h-3 w-3" />
      {:else}
        <TrendingDown class="h-3 w-3" />
      {/if}
      {metric.delta}
    </span>
  </div>

  <div class="mt-3 flex items-end justify-between gap-3">
    <p class="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">{metric.value}</p>
    {#if sparkPoints}
      <svg viewBox="0 0 68 28" class="h-7 w-17 shrink-0 overflow-visible" aria-hidden="true">
        <polyline
          fill="none"
          stroke={metric.trend === 'up' ? '#10b981' : '#f43f5e'}
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          points={sparkPoints}
        />
      </svg>
    {/if}
  </div>
</div>

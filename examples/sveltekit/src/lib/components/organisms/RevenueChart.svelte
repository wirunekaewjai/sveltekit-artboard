<script lang="ts">
  import type { RevenuePoint } from '#lib/types/domain.ts';

  type Props = {
    data: RevenuePoint[];
    period?: '6m' | '12m';
    onperiodchange?: (period: '6m' | '12m') => void;
  };

  let { data, period = '6m', onperiodchange }: Props = $props();

  let hoveredMonth = $state<string | null>(null);

  const maxVal = $derived(
    Math.max(
      ...data.flatMap((d) => {
        return [d.revenue, d.target];
      }),
      1,
    ),
  );
</script>

<div
  class="@container rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
>
  <div class="flex flex-col gap-3 @md:flex-row @md:items-center @md:justify-between">
    <div>
      <h2 class="text-sm font-semibold text-slate-900 dark:text-zinc-50">
        Monthly Recurring Revenue
      </h2>
      <p class="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
        Actual revenue vs quarterly target (USD thousands)
      </p>
    </div>

    <div class="inline-flex self-start rounded-lg bg-slate-100 p-0.5 dark:bg-zinc-800">
      <button
        type="button"
        onclick={() => onperiodchange?.('6m')}
        class="cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors {period ===
        '6m'
          ? 'bg-white text-slate-900 shadow-xs dark:bg-zinc-900 dark:text-zinc-100'
          : 'text-slate-500 dark:text-zinc-400'}"
      >
        6M
      </button>
      <button
        type="button"
        onclick={() => onperiodchange?.('12m')}
        class="cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors {period ===
        '12m'
          ? 'bg-white text-slate-900 shadow-xs dark:bg-zinc-900 dark:text-zinc-100'
          : 'text-slate-500 dark:text-zinc-400'}"
      >
        12M
      </button>
    </div>
  </div>

  <div class="mt-6 flex h-48 items-end gap-2 @md:gap-3">
    {#each data as point (point.month)}
      {@const revHeight = Math.round((point.revenue / maxVal) * 100)}
      {@const targetHeight = Math.round((point.target / maxVal) * 100)}
      <div
        role="group"
        aria-label="{point.month}: ${point.revenue}k"
        onmouseenter={() => (hoveredMonth = point.month)}
        onmouseleave={() => (hoveredMonth = null)}
        class="group relative flex h-full flex-1 flex-col items-center justify-end gap-2"
      >
        {#if hoveredMonth === point.month}
          <div
            class="pointer-events-none absolute -top-8 z-10 rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium whitespace-nowrap text-white shadow-md dark:bg-zinc-100 dark:text-zinc-900"
          >
            ${point.revenue}k / ${point.target}k
          </div>
        {/if}

        <div class="flex h-full w-full items-end justify-center gap-1">
          <div
            class="w-1/2 max-w-5 rounded-t-md bg-slate-200 transition-all dark:bg-zinc-700"
            style="height: {targetHeight}%"
          ></div>
          <div
            class="w-1/2 max-w-5 rounded-t-md bg-indigo-600 transition-all group-hover:bg-indigo-500 dark:bg-indigo-500"
            style="height: {revHeight}%"
          ></div>
        </div>
        <span class="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
          {point.month}
        </span>
      </div>
    {/each}
  </div>

  <div
    class="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3 text-xs dark:border-zinc-800"
  >
    <span class="inline-flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
      <span class="h-2.5 w-2.5 rounded-xs bg-indigo-600 dark:bg-indigo-500"></span>
      Actual
    </span>
    <span class="inline-flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
      <span class="h-2.5 w-2.5 rounded-xs bg-slate-200 dark:bg-zinc-700"></span>
      Target
    </span>
  </div>
</div>

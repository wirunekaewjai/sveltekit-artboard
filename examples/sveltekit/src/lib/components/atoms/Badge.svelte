<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    tone?: 'neutral' | 'indigo' | 'emerald' | 'amber' | 'rose';
    dot?: boolean;
    children: Snippet;
  };

  let { tone = 'neutral', dot = false, children }: Props = $props();

  const toneClasses: Record<NonNullable<Props['tone']>, string> = {
    neutral:
      'bg-slate-100 text-slate-700 ring-slate-200/80 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700',
    indigo:
      'bg-indigo-50 text-indigo-700 ring-indigo-200/80 dark:bg-indigo-500/15 dark:text-indigo-300 dark:ring-indigo-500/30',
    emerald:
      'bg-emerald-50 text-emerald-700 ring-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30',
    amber:
      'bg-amber-50 text-amber-700 ring-amber-200/80 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200/80 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/30',
  };

  const dotClasses: Record<NonNullable<Props['tone']>, string> = {
    neutral: 'bg-slate-500 dark:bg-zinc-400',
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  };
</script>

<span
  class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset {toneClasses[
    tone
  ]}"
>
  {#if dot}
    <span class="h-1.5 w-1.5 rounded-full {dotClasses[tone]}"></span>
  {/if}
  {@render children()}
</span>

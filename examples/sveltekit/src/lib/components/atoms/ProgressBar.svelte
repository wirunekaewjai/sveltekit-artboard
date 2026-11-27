<script lang="ts">
  type Props = {
    value: number;
    tone?: 'indigo' | 'emerald' | 'amber' | 'rose';
    showLabel?: boolean;
  };

  let { value, tone = 'indigo', showLabel = false }: Props = $props();

  const clamped = $derived(Math.max(0, Math.min(100, value)));

  const barClasses: Record<NonNullable<Props['tone']>, string> = {
    indigo: 'bg-indigo-600 dark:bg-indigo-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  };
</script>

<div class="w-full">
  {#if showLabel}
    <div class="mb-1 flex items-center justify-between text-xs">
      <span class="text-slate-500 dark:text-zinc-400">Progress</span>
      <span class="font-medium text-slate-800 dark:text-zinc-200">{clamped}%</span>
    </div>
  {/if}
  <div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
    <div
      class="h-full rounded-full transition-all duration-300 {barClasses[tone]}"
      style="width: {clamped}%"
    ></div>
  </div>
</div>

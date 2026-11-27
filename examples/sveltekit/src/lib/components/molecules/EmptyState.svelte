<script lang="ts">
  import { FolderSearch } from '@lucide/svelte';

  import Button from '#lib/components/atoms/Button.svelte';

  type Props = {
    title: string;
    description: string;
    actionLabel?: string;
    onaction?: () => void;
  };

  let { title, description, actionLabel, onaction }: Props = $props();
</script>

<div
  class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-12 text-center dark:border-zinc-700 dark:bg-zinc-900/50"
>
  <div
    class="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-xs ring-1 ring-slate-200 dark:bg-zinc-800 dark:text-indigo-400 dark:ring-zinc-700"
  >
    <FolderSearch class="h-6 w-6" />
  </div>
  <h3 class="mt-4 text-sm font-semibold text-slate-900 dark:text-zinc-100">{title}</h3>
  <p class="mt-1 max-w-xs text-xs leading-relaxed text-slate-500 dark:text-zinc-400">
    {description}
  </p>
  {#if actionLabel && onaction}
    <div class="mt-5">
      <Button variant="secondary" size="sm" onclick={onaction}>{actionLabel}</Button>
    </div>
  {/if}
</div>

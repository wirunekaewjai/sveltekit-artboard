<script lang="ts">
  import { Plus, Search } from '@lucide/svelte';

  import type { ProjectStatus } from '#lib/types/domain.ts';

  import Button from '#lib/components/atoms/Button.svelte';

  type Props = {
    query: string;
    activeStatus: ProjectStatus | 'all';
    onquerychange?: (value: string) => void;
    onstatuschange?: (status: ProjectStatus | 'all') => void;
    oncreate?: () => void;
  };

  let { query, activeStatus, onquerychange, onstatuschange, oncreate }: Props = $props();

  const statuses: Array<{ id: ProjectStatus | 'all'; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'review', label: 'In Review' },
    { id: 'completed', label: 'Completed' },
    { id: 'paused', label: 'Paused' },
  ];
</script>

<div class="@container flex flex-col gap-3">
  <div class="flex flex-col gap-3 @xl:flex-row @xl:items-center @xl:justify-between">
    <div class="relative flex-1 @xl:max-w-sm">
      <Search
        class="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500"
      />
      <input
        type="search"
        value={query}
        placeholder="Search projects or clients..."
        oninput={(e) => onquerychange?.((e.currentTarget as HTMLInputElement).value)}
        class="h-9.5 w-full rounded-lg border border-slate-200 bg-white pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
      />
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <div
        class="inline-flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-zinc-800/80"
      >
        {#each statuses as item (item.id)}
          <button
            type="button"
            onclick={() => onstatuschange?.(item.id)}
            class="cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors {activeStatus ===
            item.id
              ? 'bg-white text-slate-900 shadow-xs dark:bg-zinc-900 dark:text-zinc-50'
              : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200'}"
          >
            {item.label}
          </button>
        {/each}
      </div>

      {#if oncreate}
        <Button size="md" onclick={oncreate}>
          <Plus class="h-4 w-4" />
          New Project
        </Button>
      {/if}
    </div>
  </div>
</div>
